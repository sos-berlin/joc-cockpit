var JSGantt = function () {
  return function (t) {
    var e = {};

    function i(n) {
      if (e[n]) return e[n].exports;
      let r = e[n] = {i: n, l: !1, exports: {}};
      return t[n].call(r.exports, r, r.exports, i), r.l = !0, r.exports
    }

    return i(i.s = 158)
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
        var s = t.getBoundingClientRect(), a = document.body,
          o = document.documentElement || document.body.parentNode || document.body,
          l = window.pageYOffset || o.scrollTop || a.scrollTop, c = window.pageXOffset || o.scrollLeft || a.scrollLeft,
          h = o.clientTop || a.clientTop || 0, d = o.clientLeft || a.clientLeft || 0;
        e = s.top + l - h, i = s.left + c - d, n = document.body.offsetWidth - s.right, r = document.body.offsetHeight - s.bottom
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
      if (!t) return "";
      var e = t.className || "";
      return e.baseVal && (e = e.baseVal), e.indexOf || (e = ""), a(e)
    }

    var r = document.createElement("div");

    function s(t) {
      return t.tagName ? t : (t = t || window.event).target
    }

    function a(t) {
      return (String.prototype.trim || function () {
        return this.replace(/^\s+|\s+$/g, "")
      }).apply(t)
    }

    t.exports = {
      getNodePosition: i, getScrollSize: function () {
        var t = document.createElement("div");
        t.style.cssText = "visibility:hidden;position:absolute;left:-1000px;width:100px;padding:0px;margin:0px;height:110px;min-height:100px;overflow-y:scroll;", document.body.appendChild(t);
        var e = t.offsetWidth - t.clientWidth;
        return document.body.removeChild(t), e
      }, getClassName: n, addClassName: function (t, e) {
        e && -1 === t.className.indexOf(e) && (t.className += " " + e)
      }, removeClassName: function (t, e) {
        e = e.split(" ");
        for (var i = 0; i < e.length; i++) {
          var n = new RegExp("\\s?\\b" + e[i] + "\\b(?![-_.])", "");
          t.className = t.className.replace(n, "")
        }
      }, insertNode: function (t, e) {
        r.innerHTML = e;
        var i = r.firstChild;
        return t.appendChild(i), i
      }, removeNode: function (t) {
        t && t.parentNode && t.parentNode.removeChild(t)
      }, getChildNodes: function (t, e) {
        for (var i = t.childNodes, n = i.length, r = [], s = 0; s < n; s++) {
          var a = i[s];
          a.className && -1 !== a.className.indexOf(e) && r.push(a)
        }
        return r
      }, toNode: function (t) {
        return "string" == typeof t ? document.getElementById(t) || document.querySelector(t) || document.body : t || document.body
      }, locateClassName: function (t, e, i) {
        var r = s(t), o = "";
        for (void 0 === i && (i = !0); r;) {
          if (o = n(r)) {
            var l = o.indexOf(e);
            if (l >= 0) {
              if (!i) return r;
              var c = 0 === l || !a(o.charAt(l - 1)), h = l + e.length >= o.length || !a(o.charAt(l + e.length));
              if (c && h) return r
            }
          }
          r = r.parentNode
        }
        return null
      }, locateAttribute: function (t, e) {
        if (e) {
          for (var i = s(t); i;) {
            if (i.getAttribute && i.getAttribute(e)) return i;
            i = i.parentNode
          }
          return null
        }
      }, getTargetNode: s, getRelativeEventPosition: function (t, e) {
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
      for (let n = 0; n < t.length; n++) e(t[n], n) && (i[i.length] = t[n]);
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
      }, arrayFilter: n, arrayDifference: function (t, e) {
        return n(t, function (t, i) {
          return !e(t, i)
        })
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
      }
    }
  }, function (t, e) {
    var i = function () {
      this._connected = [], this._silent_mode = !1
    };
    i.prototype = {}, t.exports = function (t) {
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

    t.exports = function (t) {
      return i
    }
  }, function (t, e, i) {
    var n = i(0), r = i(4), s = i(1), a = function () {
      "use strict";

      function t(t, e, i, a) {
        t && (this.$container = s.toNode(t), this.$parent = t), this.$config = n.mixin(e, {headerHeight: 33}), this.$jsgantt = a, this.$domEvents = a._createDomEventScope(), this.$id = e.id || "c" + n.uid(), this.$name = "cell", this.$factory = i, r(this)
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
          s.locateAttribute(e, "data-cell-id") == t.$id && t.toggle()
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
        if (this.$view.style.height = e + "px", $(this.$view).hasClass("jsgantt-layout-cell jsgantt-hor-scroll")) {
          let e = this, i = setTimeout(function () {
            if ($(".jsgantt-resizer-x").position()) {
              let i = $(".jsgantt-resizer-x").position().left;
              e.$view.style.width = t - i + "px", e.$view.style.marginLeft = i + "px"
            }
            clearTimeout(i)
          }, 0)
        } else this.$view.style.width = t + "px";
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
        for (var n in this._borders) s.removeClassName(i, this._borders[n]);
        "string" == typeof t && (t = [t]);
        var r = {};
        for (n = 0; n < t.length; n++) s.addClassName(i, t[n]), r[t[n]] = !0;
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
      return function () {
      }
    }
  }, function (t, e) {
    var i = {
      isIE: navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0,
      isOpera: navigator.userAgent.indexOf("Opera") >= 0,
      isChrome: navigator.userAgent.indexOf("Chrome") >= 0,
      isKHTML: navigator.userAgent.indexOf("Safari") >= 0 || navigator.userAgent.indexOf("Konqueror") >= 0,
      isFF: navigator.userAgent.indexOf("Firefox") >= 0,
      isIPad: navigator.userAgent.search(/iPad/gi) >= 0,
      isEdge: -1 != navigator.userAgent.indexOf("Edge")
    };
    t.exports = i
  }, , , function (t, e, i) {
    i(3), t.exports = {}
  }, function (t, e, i) {
    var n = i(2);
    i(11), t.exports = function (t) {
      var e = i(5)(t);

      function r() {
        return e.apply(this, arguments) || this
      }

      return n(r, e), r
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
            var i = this, s = n.delay(function () {
              i.$jsgantt.getState().lightbox ? s() : i.$config.rowStore.refresh()
            }, 300);
            this._delayRender = s;
            var a = "_attached_" + e.$config.name;
            i[a] || (i[a] = t.attachEvent("onStoreUpdated", s)), this.$jsgantt.attachEvent("onDestroy", function () {
              return r(i), !0
            }), e.$attachedResourceViewHandler || (e.$attachedResourceViewHandler = e.attachEvent("onBeforeStoreUpdate", function () {
              if (i.$jsgantt.getState().lightbox) return !1;
              s.$pending && s.$cancelTimeout(), i._updateNestedTasks()
            }))
          }
        }, _updateNestedTasks: function () {
          var t = this.$jsgantt, e = t.getDatastore(t.config.resource_store);
          if (e.$config.fetchTasks) {
            var i = t.config.resource_property;
            e.silent(function () {
              var n = [], r = {}, s = {};
              for (var a in e.eachItem(function (a) {
                "task" != a.$role ? t.getTaskBy(i, a.id).forEach(function (i) {
                  var s = t.copy(i);
                  s.id = i.id + "_" + a.id, s.$task_id = i.id, s.$resource_id = a.id, s[e.$parentProperty] = a.id, s.$role = "task", n.push(s), r[s.id] = !0
                }) : s[a.id] = !0
              }), s) r[a] || e.removeItem(a);
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
        delegate: function (i, n, r, s) {
          e.push([i, n, r, s]), t.$services.getService("mouseEvents").delegate(i, n, r, s)
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
    var n = i(1), r = i(0), s = i(4), a = i(128), o = i(32), l = function (t, e, i, n) {
      this.$config = r.mixin({}, e || {}), this.$jsgantt = n, this.$parent = t, s(this), this.$state = {}
    };
    l.prototype = {
      init: function (t) {
        var e = this.$jsgantt, n = e._waiAria.gridAttrString(), r = e._waiAria.gridDataAttrString();
        t.innerHTML = "<div class='jsgantt-grid' style='height:inherit;width:inherit;' " + n + "></div>", this.$grid = t.childNodes[0], this.$grid.innerHTML = "<div class='jsgantt-grid-scale' " + e._waiAria.gridScaleRowAttrString() + "></div><div class='jsgantt-grid-data' " + r + "></div>", this.$grid_scale = this.$grid.childNodes[0], this.$grid_data = this.$grid.childNodes[1];
        var s = this.$getConfig()[this.$config.bind + "_attribute"];
        if (!s && this.$config.bind && (s = this.$config.bind + "_id"), this.$config.item_attribute = s || null, !this.$config.layers) {
          var o = this._createLayerConfig();
          this.$config.layers = o
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
        for (var i, n = this.getGridColumns(), r = 0, s = 0, a = n.length; s < a; s++) this._validateColumnWidth(n[s], "min_width"), this._validateColumnWidth(n[s], "max_width"), this._validateColumnWidth(n[s], "width"), r += 1 * n[s].width;
        !isNaN(r) && this.$config.scrollable || (r = i = this._setColumnsWidth(t + 1)), this.$config.scrollable ? (this.$grid_scale.style.width = r + "px", this.$grid_data.style.width = r + "px") : (this.$grid_scale.style.width = "inherit", this.$grid_data.style.width = "inherit"), this.$config.width -= 1;
        var o = this.$getConfig();
        i !== t && (o.grid_width = i, this.$config.width = i - 1);
        var l = Math.max(this.$state.height - o.scale_height, 0);
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
          for (var r = this.$config.layers, s = 0; r && s < r.length; s++) {
            var a = r[s];
            a.host = this;
            var o = n.addLayer(a);
            this._taskLayers.push(o)
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
            var s = this.$rowsPlaceholder = document.createElement("div");
            s.style.visibility = "hidden", s.style.height = n + "px", s.style.width = "1px", this.$grid_data.appendChild(s)
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
          var s = n.locateAttribute(t, this.$config.item_attribute);
          return s && r.close(s.getAttribute(this.$config.item_attribute)), !1
        }, this), this.$grid), this._mouseDelegates.delegate("click", "jsgantt-open", t.bind(function (t, e, i) {
          var r = this.$config.rowStore;
          if (!r) return !0;
          var s = n.locateAttribute(t, this.$config.item_attribute);
          return s && r.open(s.getAttribute(this.$config.item_attribute)), !1
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
        var i = this.$getConfig(), n = this.getGridColumns(), r = 0, s = t;
        e = window.isNaN(e) ? -1 : e;
        for (var a = 0, o = n.length; a < o; a++) r += 1 * n[a].width;
        if (window.isNaN(r)) for (this._calculateGridWidth(), r = 0, a = 0, o = n.length; a < o; a++) r += 1 * n[a].width;
        var l = s - r, c = 0;
        for (a = 0; a < e + 1; a++) c += n[a].width;
        for (r -= c, a = e + 1; a < n.length; a++) {
          var h = n[a], d = Math.round(l * (h.width / r));
          l < 0 ? h.min_width && h.width + d < h.min_width ? d = h.min_width - h.width : !h.min_width && i.min_grid_column_width && h.width + d < i.min_grid_column_width && (d = i.min_grid_column_width - h.width) : h.max_width && h.width + d > h.max_width && (d = h.max_width - h.width), r -= h.width, h.width += d, l -= d
        }
        for (var u = l > 0 ? 1 : -1; l > 0 && 1 === u || l < 0 && -1 === u;) {
          var f = l;
          for (a = e + 1; a < n.length; a++) {
            var g;
            if ((g = n[a].width + u) == this._getColumnWidth(n[a], i, g) && (l -= u, n[a].width = g), !l) break
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
        for (var t = this.$getConfig(), e = this.getGridColumns(), i = 0, n = [], r = [], s = 0; s < e.length; s++) {
          var a = parseFloat(e[s].width);
          window.isNaN(a) && (a = t.min_grid_column_width || 10, n.push(s)), r[s] = a, i += a
        }
        var o = this._getGridWidth() + 1;
        if (t.autofit || n.length) {
          var l = o - i;
          if (t.autofit) for (s = 0; s < r.length; s++) {
            var c = Math.round(l / (r.length - s));
            r[s] += c, (h = this._getColumnWidth(e[s], t, r[s])) != r[s] && (c = h - r[s], r[s] = h), l -= c
          } else if (n.length) for (s = 0; s < n.length; s++) {
            c = Math.round(l / (n.length - s));
            var h, d = n[s];
            r[d] += c, (h = this._getColumnWidth(e[d], t, r[d])) != r[d] && (c = h - r[d], r[d] = h), l -= c
          }
          for (s = 0; s < r.length; s++) e[s].width = r[s]
        } else {
          var u = o != i;
          this.$config.width = i - 1, t.grid_width = i, u && this.$parent._setContentSize(this.$config.width, this.$config.height)
        }
      }, _renderGridHeader: function () {
        var t = this.$jsgantt, e = this.$getConfig(), i = this.$jsgantt.locale, n = this.$jsgantt.templates,
          r = this.getGridColumns();
        e.rtl && (r = r.reverse());
        for (var s = [], a = 0, o = i.labels, l = e.scale_height - 1, c = 0; c < r.length; c++) {
          var h = c == r.length - 1, d = r[c];
          d.name || (d.name = t.uid() + "");
          var u = 1 * d.width, f = this._getGridWidth();
          h && f > a + u && (d.width = u = f - a), a += u;
          var g = t._sort && d.name == t._sort.name ? "<div class='jsgantt-sort jsgantt-" + t._sort.direction + "'></div>" : "",
            _ = ["jsgantt-grid-head-cell", "jsgantt-grid-head-" + d.name, h ? "jsgantt-last-cell" : "", n.grid_header_class(d.name, d)].join(" "),
            p = "width:" + (u - (h ? 1 : 0)) + "px;padding-right:16px",
            v = d.label || o["column_" + d.name] || o[d.name];
          h && (p = "width:auto;padding-right:16px"), v = v || "";
          var m = "<div class='" + _ + "' style='" + p + "' " + t._waiAria.gridScaleCellAttrString(d, v) + " data-column-id='" + d.name + "' column_id='" + d.name + "'>" + v + g + "</div>";
          s.push(m)
        }
        this.$grid_scale.style.height = e.scale_height + "px", this.$grid_scale.style.lineHeight = l + "px", this.$grid_scale.innerHTML = s.join(""), this._renderHeaderResizers && this._renderHeaderResizers()
      }, _getGridWidth: function () {
        return this.$config.width
      }, destructor: function () {
        this._clearLayers(this.$jsgantt), this._mouseDelegates && (this._mouseDelegates.destructor(), this._mouseDelegates = null), this.$grid = null, this.$grid_scale = null, this.$grid_data = null, this.$jsgantt = null, this.$config.rowStore && (this.$config.rowStore.detachEvent(this._staticBgHandler), this.$config.rowStore = null), this.callEvent("onDestroy", []), this.detachAllEvents()
      }
    }, r.mixin(l.prototype, o()), t.exports = l
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
      var r = [], s = {
        attach: function (t, i, n, s) {
          r.push({element: t, event: i, callback: n, capture: s}), e(t, i, n, s)
        }, detach: function (t, e, n, s) {
          i(t, e, n, s);
          for (var a = 0; a < r.length; a++) {
            var o = r[a];
            o.element === t && o.event === e && o.callback === n && o.capture === s && (r.splice(a, 1), a--)
          }
        }, detachAll: function () {
          for (var t = r.slice(), e = 0; e < t.length; e++) {
            var i = t[e];
            s.detach(i.element, i.event, i.callback, i.capture), s.detach(i.element, i.event, i.callback, void 0), s.detach(i.element, i.event, i.callback, !1), s.detach(i.element, i.event, i.callback, !0)
          }
          r.splice(0, r.length)
        }, extend: function () {
          return t(this.event, this.eventRemove)
        }
      };
      return window.scopes || (window.scopes = []), window.scopes.push(r), s
    }
  }, , , , function (t, e, i) {
    var n = i(0), r = i(3);

    function s(t, e, i, n, r) {
      return this.date = t, this.unit = e, this.task = i, this.id = n, this.calendar = r, this
    }

    function a(t, e, i, n, r, s) {
      return this.date = t, this.dir = e, this.unit = i, this.task = n, this.id = r, this.calendar = s, this
    }

    function o(t, e, i, n, r, s, a) {
      return this.plannedDate = t, this.duration = e, this.unit = i, this.step = n, this.task = r, this.id = s, this.calendar = a, this
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
          return i instanceof s ? i : ((e = i.date ? new s(i.date, i.unit, i.task, null, i.calendar) : new s(arguments[0], arguments[1], arguments[2], null, arguments[3])).unit = e.unit || t.config.durationUnit, e)
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
        }, calculateEndDateArguments: function (e, i, n, s) {
          var a, l = arguments[0];
          return l instanceof o ? l : (a = r.isDate(l) ? new o(arguments[0], arguments[1], arguments[2], void 0, arguments[3], void 0, arguments[4]) : new o(l.plannedDate, l.duration, l.unit, l.step, l.task, null, l.calendar), l.id && (a.task = l), a.unit = a.unit || t.config.durationUnit, a.step = a.step || t.config.durationStep, a)
        }
      }
    }
  }, function (t, e) {
    t.exports = {}
  }, function (t, e, i) {
    var n = i(33);
    t.exports = function (t) {
      (function (t) {
        var e = function (t) {
          var e = t.config.scale_unit, i = t.config.step;
          if (t.config.scale_offset_minimal) {
            var r = new n(t), s = [r.primaryScale()].concat(t.config.subscales);
            r.sortScales(s), e = s[s.length - 1].unit, i = s[s.length - 1].step || 1
          }
          return {unit: e, step: i}
        }(t), i = e.unit, r = e.step, s = function (t, e) {
          var i = {plannedDate: null, end_date: null};
          if (e.config.plannedDate && e.config.end_date) {
            i.plannedDate = e.date[t + "_start"](new Date(e.config.plannedDate));
            var n = new Date(e.config.end_date), r = e.date[t + "_start"](new Date(n));
            n = +n != +r ? e.date.add(r, 1, t) : r, i.end_date = n
          }
          return i
        }(i, t);
        s.plannedDate && s.end_date || ((s = function (t) {
          return t.getSubtaskDates()
        }(t)).plannedDate && s.end_date || (s = {
          plannedDate: new Date,
          end_date: new Date
        }), s.plannedDate = t.date[i + "_start"](s.plannedDate), s.plannedDate = t.calculateEndDate({
          plannedDate: t.date[i + "_start"](s.plannedDate),
          duration: -1,
          unit: i,
          step: r
        }), s.end_date = t.date[i + "_start"](s.end_date), s.end_date = t.calculateEndDate({
          plannedDate: s.end_date,
          duration: 2,
          unit: i,
          step: r
        })), t._min_date = s.plannedDate, t._max_date = s.end_date
      })(t), function (t) {
        if (t.config.fit_tasks) {
          var e = +t._min_date, i = +t._max_date;
          +t._min_date == e && +t._max_date == i || (t.render(), t.callEvent("onScaleAdjusted", []))
        }
      }(t)
    }
  }, function (t, e, i) {
    var n = i(28), r = i(0), s = i(29), a = function (t) {
      return s.apply(this, [t]), this._branches = {}, this.pull = {}, this.$initItem = t.initItem, this.$parentProperty = t.parentProperty || "parent", "function" != typeof t.rootId ? this.$getRootId = function (t) {
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
        for (var e = null, i = this.$getRootId(), n = 0, s = t.length; n < s; n++) e = t[n], this.setParent(e, this.getParent(e) || i);
        for (n = 0, s = t.length; n < s; n++) e = t[n], this._add_branch(e), e.$level = this.calculateItemLevel(e), r.defined(e.$open) || (e.$open = r.defined(e.open) ? e.open : this.$openInitially());
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
        1 * n !== n && (n = void 0), s.prototype._addItemInner.call(this, t, n), this.setParent(t, i), t.hasOwnProperty("$rendered_parent") && this._move_branch(t, t.$rendered_parent), this._add_branch(t, e)
      }, _changeIdInner: function (t, e) {
        var i = this.getChildren(t), n = this._searchVisibleOrder[t];
        s.prototype._changeIdInner.call(this, t, e);
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
        }), t && s.prototype._updateOrder.call(this, t)
      }, _removeItemInner: function (t) {
        var e = [];
        this.eachItem(function (t) {
          e.push(t)
        }, t), e.push(this.getItem(t));
        for (var i = 0; i < e.length; i++) this._move_branch(e[i], this.getParent(e[i]), null), s.prototype._removeItemInner.call(this, e[i].id), this._move_branch(e[i], this.getParent(e[i]), null)
      }, move: function (t, e, i) {
        var n = arguments[3];
        if (n) {
          if (n === t) return;
          i = this.getParent(n), e = this.getBranchIndex(n)
        }
        if (t != i) {
          i = i || this.$getRootId();
          var r = this.getItem(t), s = this.getParent(r.id), a = this.getChildren(i);
          if (-1 == e && (e = a.length + 1), s == i && this.getBranchIndex(t) == e) return;
          if (!1 !== this.callEvent("onBeforeItemMove", [t, i, e])) {
            this._replace_branch_child(s, t), (a = this.getChildren(i))[e] ? a = a.slice(0, e).concat([t]).concat(a.slice(e)) : a.push(t), this.setParent(r, i), this._branches[i] = a;
            var o = this.calculateItemLevel(r) - r.$level;
            r.$level += o, this.eachItem(function (t) {
              t.$level += o
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
        this._branches = {}, s.prototype.clearAll.call(this)
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
        for (var s = this.getChildren(r), a = !1, o = 0, l = s.length; o < l; o++) if (s[o] == t.id) {
          a = !0;
          break
        }
        a || (1 * e == e ? s.splice(e, 0, t.id) : s.push(t.id), t.$rendered_parent = r)
      }, _move_branch: function (t, e, i) {
        this._replace_branch_child(e, t.id), this.exists(i) || i == this.$getRootId() ? this._add_branch(t, void 0, i) : delete this._branches[t.id], t.$level = this.calculateItemLevel(t), this.eachItem(function (t) {
          t.$level = this.calculateItemLevel(t)
        }, t.id)
      }, _replace_branch_child: function (t, e, i) {
        var r = this.getChildren(t);
        if (r && void 0 !== t) {
          for (var s = n.$create(), a = 0; a < r.length; a++) r[a] != e ? s.push(r[a]) : i && s.push(i);
          this._branches[t] = s
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
        var s = this.getChildren(i);
        if (s) {
          for (var a = [], o = s.length - 1; o >= 0; o--) a[o] = this.getItem(s[o]);
          for (a.sort(n), o = 0; o < a.length; o++) s[o] = a[o].id, this.sort(t, e, s[o])
        }
      }, filter: function (t) {
        for (var e in this.pull) this.pull[e].$rendered_parent !== this.getParent(this.pull[e]) && this._move_branch(this.pull[e], this.pull[e].$rendered_parent, this.getParent(this.pull[e]));
        return s.prototype.filter.apply(this, arguments)
      }, open: function (t) {
        this.exists(t) && (this.getItem(t).$open = !0, this.callEvent("onItemOpen", [t]))
      }, close: function (t) {
        this.exists(t) && (this.getItem(t).$open = !1, this.callEvent("onItemClose", [t]))
      }, destructor: function () {
        s.prototype.destructor.call(this), this._branches = null
      }
    }, s.prototype), t.exports = a
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
    var n = i(28), r = i(0), s = i(4), a = function (t) {
      return this.pull = {}, this.$initItem = t.initItem, this.visibleOrder = n.$create(), this.fullOrder = n.$create(), this._skip_refresh = !1, this._filterRule = null, this._searchVisibleOrder = {}, this.$config = t, s(this), this
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
      function e(e, r) {
        var s = r.getItemPosition(e), a = r.$getConfig(), o = r.$getTemplates(), l = r.getItemHeight(),
          c = t.getTaskType(e.type), h = Math.floor((t.config.row_height - l) / 2);
        c == a.types.milestone && a.link_line_width > 1 && (h += 1), c == a.types.milestone && (s.left -= Math.round(l / 2), s.width = l);
        var d = document.createElement("div"), u = Math.round(s.width);
        r.$config.item_attribute && d.setAttribute(r.$config.item_attribute, e.id), a.show_progress && c != a.types.milestone && function (e, i, n, r, s) {
          var a = 1 * e.progress || 0;
          n = Math.max(n - 2, 0);
          var o = document.createElement("div"), l = Math.round(n * a);
          l = Math.min(n, l), e.progressColor && (o.style.backgroundColor = e.progressColor, o.style.opacity = 1), o.style.width = l + "px", o.className = "jsgantt-task-background", r.rtl && (o.style.position = "absolute", o.style.right = "0px");
          var c = document.createElement("div");
          if (c.className = "jsgantt-task-progress-wrapper", c.appendChild(o), i.appendChild(c), t.config.drag_progress && !t.isReadonly(e)) {
            var h = document.createElement("div"), d = l;
            r.rtl && (d = n - l), h.style.left = d + "px", h.className = "jsgantt-task-progress-drag", o.appendChild(h), i.appendChild(h)
          }
        }(e, d, u, a);
        var f = function (e, i, n) {
          var r = document.createElement("div");
          r.className = "jsgantt-task-content my-tooltip",
            r.title = "<b>"+t.config.orderId+":</b>" + e.col1 + "<br/>";
          if(e.repeat){
            r.title += t.config.repeatEvery + e.repeat + "<br/>";
          }
          if(e.cyclicOrder){
            r.title += "<div class=\"m-a-sm m-t-xs\"><b>"+t.config.cyclicOrder+"</b> <br/>";
            r.title += "<span class=\"_600 p-l-sm\">" + t.config.begin + ": </span>" + e.begin + "<br/>";
            r.title += "<span class=\"_600 p-l-sm\">" + t.config.end + ": </span>" + e.end + "<br/>";
            r.title += "<span class=\"_600 p-l-sm\">" + t.config.orders + ": </span>" + e.cyclicOrder.count + "</div>";
          }
          var s = document.createAttribute("data-toggle");
          s.value = "tooltip", r.setAttributeNode(s);
          var a = document.createAttribute("data-html");
          return a.value = "true", r.setAttributeNode(a), t.getTaskType(e.type), t.config.types.milestone, r
        }(e);
        e.textColor && (f.style.color = e.textColor), d.appendChild(f);
        var g = function (t, e, i, n) {
          let r = ["jsgantt-task-line"];
          return e && r.push(e), r.push("jsgantt-bar-task"), r.join(" ")
        }(0, o.task_class(e.plannedDate, e.end_date, e), e.id);
        (e.color || e.progressColor || e.textColor) && (g += " jsgantt-task-inline-color"), d.className = g;
        var _ = ["left:" + s.left + "px", "top:" + (h + s.top) + "px", "height:" + l + "px", "line-height:" + Math.max(l < 30 ? l - 2 : l, 0) + "px", "width:" + u + "px"];
        e.color && _.push("background-color:" + e.color), e.textColor && _.push("color:" + e.textColor), d.style.cssText = _.join(";");
        var p = function (t, e, n) {
          var r = "jsgantt-left " + (a.rtl, "");
          return i(t, n.leftside_text, r)
        }(e, 0, o);
        p && d.appendChild(p), (p = function (t, e, n) {
          var r = "jsgantt-right " + (a.rtl, "");
          return i(t, n.rightside_text, r)
        }(e, 0, o)) && d.appendChild(p), t._waiAria.setTaskBarAttr(e, d);
        var v = t.getState();
        return t.isReadonly(e) || (a.drag_resize && !t.isSummaryTask(e) && c != a.types.milestone && n(d, "jsgantt-task-drag", e, function (t) {
          var e = document.createElement("div");
          return e.className = t, e
        }, a), a.drag_links && a.show_links && n(d, "jsgantt-link-control", e, function (t) {
          var e = document.createElement("div");
          e.className = t, e.style.cssText = ["height:" + l + "px", "line-height:" + l + "px"].join(";");
          var i = document.createElement("div");
          i.className = "jsgantt-link-point";
          var n = !1;
          return v.link_source_id && a.touch && (n = !0), i.style.display = n ? "block" : "", e.appendChild(i), e
        }, a)), d
      }

      function i(t, e, i) {
        if (!e) return null;
        var n = e(t.plannedDate, t.end_date, t);
        if (!n) return null;
        var r = document.createElement("div");
        return r.className = "jsgantt-side-content " + i, r.innerHTML = n, r
      }

      function n(e, i, n, r, s) {
        var a, o = t.getState();
        +n.plannedDate >= +o.min_date && ((a = r([i, s.rtl ? "task-right" : "task-left", "task-start-date"].join(" "))).setAttribute("data-bind-property", "plannedDate"), e.appendChild(a)), +n.end_date <= +o.max_date && ((a = r([i, s.rtl ? "task-left" : "task-right", "task-end_date"].join(" "))).setAttribute("data-bind-property", "end_date"), e.appendChild(a))
      }

      return function (i, n) {
        var r = n.$getConfig().type_renderers[t.getTaskType(i.type)], s = e;
        return r ? r.call(t, i, function (e) {
          return s.call(t, e, n)
        }, n) : s.call(t, i, n)
      }
    }
  }, function (t, e, i) {
    var n = i(0), r = i(34), s = i(14), a = i(2), o = function (t) {
      function e(e, i, n, r) {
        var s = t.apply(this, arguments) || this;
        return s.$config.bindLinks = null, s
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
      }, !0), n.mixin(e.prototype, s(e), !0), e
    }(r);
    t.exports = o
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
    var n = i(33), r = i(4), s = i(0), a = i(32), o = i(129), l = function (t, e, i, a) {
      this.$config = s.mixin({}, e || {}), this.$scaleHelper = new n(a), this.$jsgantt = a, r(this)
    };

    function c(t, e) {
      for (var i, n, r, s = 0, a = t.length - 1; s <= a;) if (n = +t[i = Math.floor((s + a) / 2)], r = +t[i - 1], n < e) s = i + 1; else {
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
        for (var s = this._tasks, a = this.$task_data.childNodes, o = 0, l = a.length; o < l; o++) {
          var c = a[o];
          c.hasAttribute("data-layer") && c.style && (c.style.width = s.full_width + "px")
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
          for (var r = this.$config.layers, s = 0; r && s < r.length; s++) {
            "string" == typeof (c = r[s]) && (c = this.$jsgantt.$ui.layers[c]), "function" == typeof c && (c = {renderer: c}), c.host = this;
            var a = n.addLayer(c);
            this._taskLayers.push(a), c.expose && (this._taskRenderer = n.getLayer(a))
          }
          this._initStaticBackgroundRender()
        }
        if (this.$config.bindLinks) {
          e.$config.linkStore = e.$jsgantt.getDatastore(e.$config.bindLinks);
          var o = i.getDataRender(this.$config.bindLinks);
          o || (o = i.createDataRender({
            name: this.$config.bindLinks, defaultContainer: function () {
              return e.$task_data
            }
          }));
          var l = this.$config.linkLayers;
          for (s = 0; l && s < l.length; s++) {
            var c;
            "string" == typeof c && (c = this.$jsgantt.$ui.layers[c]), (c = l[s]).host = this;
            var h = o.addLayer(c);
            this._taskLayers.push(h), l[s].expose && (this._linkRenderer = o.getLayer(h))
          }
        }
      }, _initStaticBackgroundRender: function () {
        var t = this, e = o.create(), i = t.$config.rowStore;
        i && (this._staticBgHandler = i.attachEvent("onStoreUpdated", function (i, n, r) {
          if (null === i && t.isVisible()) {
            var s = t.$getConfig();
            if (s.static_background) {
              var a = t.$jsgantt.getDatastore(t.$config.bind);
              a && e.render(t.$task_bg, s, t.getScale(), s.row_height * a.countVisible())
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
          var s = this.$scaleHelper, a = this._getScales();
          n = t.scale_height;
          var o = this.$config.width;
          "x" != t.autosize && "xy" != t.autosize || (o = Math.max(t.autosize_min_width, 0));
          var l = s.prepareConfigs(a, t.min_column_width, o, n - 1, r.min_date, r.max_date, t.rtl),
            c = this._tasks = l[l.length - 1];
          this._scales = l, e = this._getScaleChunkHtml(l, 0, this.$config.width), i = c.full_width + "px", n += "px"
        }
        this.$task_scale.style.height = n, this.$task_data.style.width = this.$task_scale.style.width = i, this.$task_scale.innerHTML = e
      }, _getScaleChunkHtml: function (t, e, i) {
        for (var n = [], r = this.$jsgantt.$services.templates().scale_row_class, s = 0; s < t.length; s++) {
          var a = "jsgantt-scale-line", o = r(t[s]);
          o && (a += " " + o), n.push('<div class="' + a + '" style="height:' + t[s].height + "px;position:relative;line-height:" + t[s].height + 'px">' + this._prepareScaleHtml(t[s], e, i) + "</div>")
        }
        return n.join("")
      }, _prepareScaleHtml: function (t, e, i) {
        var n = this.$getConfig(), r = this.$jsgantt.$services.templates(), s = [], a = null, o = null, l = null;
        (t.template || t.date) && (o = t.template || this.$jsgantt.date.date_to_str(t.date));
        var h = 0, d = t.count;
        !n.smart_scales || isNaN(e) || isNaN(i) || (h = c(t.left, e), d = c(t.left, i) + 1), l = t.css || function () {
        }, !t.css && n.inherit_scale_class && (l = r.scale_cell_class);
        for (var u = h; u < d && t.trace_x[u]; u++) {
          a = new Date(t.trace_x[u]);
          var f = o.call(this, a), g = t.width[u], _ = t.height, p = t.left[u], v = "", m = "", $ = "";
          if (g) {
            v = "width:" + g + "px;height:" + _ + "px;" + (n.smart_scales ? "position:absolute;left:" + p + "px" : ""), $ = "jsgantt-scale-cell" + (u == t.count - 1 ? " jsgantt-last-cell" : ""), (m = l.call(this, a)) && ($ += " " + m);
            var y = "<div class='" + $ + "'" + this.$jsgantt._waiAria.getTimelineCellAttr(f) + " style='" + v + "'>" + f + "</div>";
            s.push(y)
          }
        }
        return s.join("")
      }, dateFromPos: function (t) {
        var e = this._tasks;
        if (t < 0 || t > e.full_width || !e.full_width) return null;
        var i = c(this._tasks.left, t), n = this._tasks.left[i], r = e.width[i] || e.col_width, s = 0;
        r && (s = (t - n) / r, e.rtl && (s = 1 - s));
        var a = 0;
        return s && (a = this._getColumnDuration(e, e.trace_x[i])), new Date(e.trace_x[i].valueOf() + Math.round(s * a))
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
        var s = c(i, e), a = this._getClosestVisibleColumn(s, i, n), o = i[a], l = this._tasks.trace_index_transition;
        if (!o) return l ? l[0] : 0;
        var h = (t - i[a]) / this._getColumnDuration(this._tasks, i[a]);
        return l ? l[a] + (1 - h) : a + h
      }, getItemPosition: function (t, e, i) {
        var n, r, s;
        return this._tasks.rtl ? (r = this.posFromDate(e || t.plannedDate), n = this.posFromDate(i || t.end_date)) : (n = this.posFromDate(e || t.plannedDate), r = this.posFromDate(i || t.end_date)), s = Math.max(r - n, 0), {
          left: n,
          top: this.getItemTop(t.id),
          height: this.getItemHeight(),
          width: s
        }
      }, getItemHeight: function () {
        var t = this.$getConfig(), e = 18;
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
    }, s.mixin(l.prototype, a()), t.exports = l
  }, function (t, e, i) {
    var n = i(2), r = i(1), s = function (t) {
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
        var i, n = !1, r = [], s = [];

        function a(t) {
          t.$parent.show(), n = !0, r.push(t)
        }

        function o(t) {
          t.$parent.hide(), n = !0, s.push(t)
        }

        for (var l = 0; l < e.length; l++) t[(i = e[l]).$config.scroll] ? o(i) : i.shouldHide() ? o(i) : i.shouldShow() ? a(i) : i.isVisible() ? r.push(i) : s.push(i);
        var c = {};
        for (l = 0; l < r.length; l++) r[l].$config.group && (c[r[l].$config.group] = !0);
        for (l = 0; l < s.length; l++) (i = s[l]).$config.group && c[i.$config.group] && a(i);
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
          var s = t[r].getSize(),
            a = n > 0 ? t[r].$parent.getNextSibling(t[r].$id) : t[r].$parent.getPrevSibling(t[r].$id);
          "resizer" == a.$name && (a = n > 0 ? a.$parent.getNextSibling(a.$id) : a.$parent.getPrevSibling(a.$id));
          var o = a.getSize();
          if (a[i]) {
            var l = s.gravity + o.gravity, c = s[i] + o[i], h = l / c;
            t[r].$config.gravity = h * e, a.$config[i] = c - e, a.$config.gravity = l - h * e
          } else t[r].$config[i] = e;
          var d = this.$jsgantt.$ui.getView("grid");
          d && t[r].$content === d && !d.$config.scrollable && (this.$jsgantt.config.grid_width = e)
        }
      }, e.prototype.resize = function (e) {
        var i = !1;
        if (this.$root && !this._resizeInProgress && (this.callEvent("onBeforeResize", []), i = !0, this._resizeInProgress = !0), t.prototype.resize.call(this, !0), t.prototype.resize.call(this, !1), i) {
          var n = [];
          n = (n = (n = n.concat(this.getCellsByType("viewCell"))).concat(this.getCellsByType("viewLayout"))).concat(this.getCellsByType("hostCell"));
          for (var r = this.getCellsByType("scroller"), s = 0; s < n.length; s++) n[s].$config.hidden || n[s].setContentSize();
          var a = this._getAutosizeMode(this.$config.autosize), o = this._resizeScrollbars(a, r);
          if (this.$config.autosize && (this.autosize(this.$config.autosize), o = !0), o) for (this.resize(), s = 0; s < n.length; s++) n[s].$config.hidden || n[s].setContentSize();
          this.callEvent("onPanelResize", [])
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
          var s = this.$cells[n];
          s.$fill(i[n], this), s.$config.hidden && s.$view.parentNode.removeChild(s.$view)
        }
      }, e.prototype.$toHTML = function () {
        for (var e = this._xLayout ? "x" : "y", i = [], n = 0; n < this.$cells.length; n++) i.push(this.$cells[n].$toHTML());
        return t.prototype.$toHTML.call(this, i.join(""), (this.$root ? "jsgantt-layout-root " : "") + "jsgantt-layout jsgantt-layout-" + e)
      }, e.prototype.getContentSize = function (t) {
        for (var e, i, n, r = 0, s = 0, a = 0; a < this.$cells.length; a++) (i = this.$cells[a]).$config.hidden || (e = i.getContentSize(t), "scrollbar" === i.$config.view && t[i.$config.scroll] && (e.height = 0, e.width = 0), i.$config.resizer && (this._xLayout ? e.height = 0 : e.width = 0), n = i._getBorderSizes(), this._xLayout ? (r += e.width + n.horizontal, s = Math.max(s, e.height + n.vertical)) : (r = Math.max(r, e.width + n.horizontal), s += e.height + n.vertical));
        return r += (n = this._getBorderSizes()).horizontal, s += n.vertical, this.$root && (r += 1, s += 1), {
          width: r,
          height: s
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
        var s = {
          horPaddings: n.paddingLeft + n.paddingRight + n.borderLeftWidth + n.borderRightWidth,
          vertPaddings: n.paddingTop + n.paddingBottom + n.borderTopWidth + n.borderBottomWidth,
          borderBox: n.boxSizing,
          innerWidth: n.width,
          innerHeight: n.height,
          outerWidth: n.width,
          outerHeight: n.height
        };
        return s.borderBox ? (s.innerWidth -= s.horPaddings, s.innerHeight -= s.vertPaddings) : (s.outerWidth += s.horPaddings, s.outerHeight += s.vertPaddings), s
      }, e.prototype._getAutosizeMode = function (t) {
        var e = {x: !1, y: !1};
        return "xy" === t ? e.x = e.y = !0 : "y" === t || !0 === t ? e.y = !0 : "x" === t && (e.x = !0), e
      }, e.prototype.autosize = function (t) {
        var e = this._getAutosizeMode(t), i = this._getBoxStyles(this.$container), n = this.getContentSize(t),
          r = this.$container;
        e.x && (i.borderBox && (n.width += i.horPaddings), r.style.width = n.width + "px"), e.y && (i.borderBox && (n.height += i.vertPaddings), r.style.height = n.height + "px")
      }, e.prototype.getSize = function () {
        this._sizes = [];
        for (var e = 0, i = 0, n = 1e5, r = 0, s = 1e5, a = 0, o = 0; o < this.$cells.length; o++) {
          var l = this._sizes[o] = this.$cells[o].getSize();
          this.$cells[o].$config.hidden || (this._xLayout ? (!l.width && l.minWidth ? e += l.minWidth : e += l.width, n += l.maxWidth, i += l.minWidth, r = Math.max(r, l.height), s = Math.min(s, l.maxHeight), a = Math.max(a, l.minHeight)) : (!l.height && l.minHeight ? r += l.minHeight : r += l.height, s += l.maxHeight, a += l.minHeight, e = Math.max(e, l.width), n = Math.min(n, l.maxWidth), i = Math.max(i, l.minWidth)))
        }
        var c = t.prototype.getSize.call(this);
        return c.maxWidth >= 1e5 && (c.maxWidth = n), c.maxHeight >= 1e5 && (c.maxHeight = s), c.minWidth = c.minWidth != c.minWidth ? 0 : c.minWidth, c.minHeight = c.minHeight != c.minHeight ? 0 : c.minHeight, this._xLayout ? (c.minWidth += this.$config.margin * this.$cells.length || 0, c.minWidth += 2 * this.$config.padding || 0, c.minHeight += 2 * this.$config.padding || 0) : (c.minHeight += this.$config.margin * this.$cells.length || 0, c.minHeight += 2 * this.$config.padding || 0), c
      }, e.prototype._calcFreeSpace = function (t, e, i) {
        var n = i ? e.minWidth : e.minHeight, r = e.maxWidth, s = t;
        return s ? (s > r && (s = r), s < n && (s = n), this._free -= s) : ((s = Math.floor(this._free / this._gravity * e.gravity)) > r && (s = r, this._free -= s, this._gravity -= e.gravity), s < n && (s = n, this._free -= s, this._gravity -= e.gravity)), s
      }, e.prototype._calcSize = function (t, e, i) {
        var n = t, r = i ? e.minWidth : e.minHeight, s = i ? e.maxWidth : e.maxHeight;
        return n || (n = Math.floor(this._free / this._gravity * e.gravity)), n > s && (n = s), n < r && (n = r), n
      }, e.prototype._configureBorders = function () {
        this.$root && this._setBorders([this._borders.left, this._borders.top, this._borders.right, this._borders.bottom], this);
        for (var t = this._xLayout ? this._borders.right : this._borders.bottom, e = this.$cells, i = e.length - 1, n = i; n >= 0; n--) if (!e[n].$config.hidden) {
          i = n;
          break
        }
        for (n = 0; n < e.length; n++) if (!e[n].$config.hidden) {
          var r = n >= i, s = "";
          !r && e[n + 1] && "scrollbar" == e[n + 1].$config.view && (this._xLayout ? r = !0 : s = "jsgantt-layout-cell-border-transparent"), this._setBorders(r ? [] : [t, s], e[n])
        }
      }, e.prototype._updateCellVisibility = function () {
        for (var t, e = this._visibleCells || {}, i = !this._visibleCells, n = {}, r = 0; r < this._sizes.length; r++) t = this.$cells[r], !i && t.$config.hidden && e[t.$id] ? t._hide(!0) : t.$config.hidden || e[t.$id] || t._hide(!1), t.$config.hidden || (n[t.$id] = !0);
        this._visibleCells = n
      }, e.prototype.setSize = function (e, i) {
        this._configureBorders(), t.prototype.setSize.call(this, e, i), i = this.$lastSize.contentY, e = this.$lastSize.contentX;
        var n, r, s = this.$config.padding || 0;
        this.$view.style.padding = s + "px", this._gravity = 0, this._free = this._xLayout ? e : i, this._free -= 2 * s, this._updateCellVisibility();
        for (var a = 0; a < this._sizes.length; a++) if (!(n = this.$cells[a]).$config.hidden) {
          var o = this.$config.margin || 0;
          "resizer" != n.$name || o || (o = -1);
          var l = n.$view, c = this._xLayout ? "marginRight" : "marginBottom";
          a !== this.$cells.length - 1 && (l.style[c] = o + "px", this._free -= o), r = this._sizes[a], this._xLayout ? r.width || (this._gravity += r.gravity) : r.height || (this._gravity += r.gravity)
        }
        for (a = 0; a < this._sizes.length; a++) if (!(n = this.$cells[a]).$config.hidden) {
          var h = (r = this._sizes[a]).width, d = r.height;
          this._xLayout ? this._calcFreeSpace(h, r, !0) : this._calcFreeSpace(d, r, !1)
        }
        for (a = 0; a < this.$cells.length; a++) if (!(n = this.$cells[a]).$config.hidden) {
          r = this._sizes[a];
          var u = void 0, f = void 0;
          this._xLayout ? (u = this._calcSize(r.width, r, !0), f = i - 2 * s) : (u = e - 2 * s, f = this._calcSize(r.height, r, !1)), n.setSize(u, f)
        }
      }, e
    }(i(6));
    t.exports = s
  }, function (t, e) {
    var i, n, r = t.exports = {};

    function s() {
    }

    function a() {
    }

    function o(t) {
      if (i === setTimeout) return setTimeout(t, 0);
      if ((i === s || !i) && setTimeout) return i = setTimeout, setTimeout(t, 0);
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
        i = "function" == typeof setTimeout ? setTimeout : s
      } catch (t) {
        i = s
      }
      try {
        n = "function" == typeof clearTimeout ? clearTimeout : a
      } catch (t) {
        n = a
      }
    }();
    var l, c = [], h = !1, d = -1;

    function u() {
      h && l && (h = !1, l.length ? c = l.concat(c) : d = -1, c.length && f())
    }

    function f() {
      if (!h) {
        var t = o(u);
        h = !0;
        for (var e = c.length; e;) {
          for (l = c, c = []; ++d < e;) l && l[d].run();
          d = -1, e = c.length
        }
        l = null, h = !1, function (t) {
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

    function _() {
    }

    r.nextTick = function (t) {
      var e = new Array(arguments.length - 1);
      if (arguments.length > 1) for (var i = 1; i < arguments.length; i++) e[i - 1] = arguments[i];
      c.push(new g(t, e)), 1 !== c.length || h || o(f)
    }, g.prototype.run = function () {
      this.fun.apply(null, this.array)
    }, r.title = "browser", r.browser = !0, r.env = {}, r.argv = [], r.version = "", r.versions = {}, r.on = _, r.addListener = _, r.once = _, r.off = _, r.removeListener = _, r.removeAllListeners = _, r.emit = _, r.prependListener = _, r.prependOnceListener = _, r.listeners = function (t) {
      return []
    }, r.binding = function (t) {
    }, r.cwd = function () {
      return "/"
    }, r.chdir = function (t) {
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
        e || t.config.show_errors && t.callEvent("onError", [i])
      }
    }
  }, function (t, e, i) {
    var n = i(1), r = i(3);
    t.exports = function (t) {
      var e = i(26);

      function s(t, e) {
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
        }), this.$layout.attachEvent("onPanelResize", function () {
          t.refreshData()
        }), this.callEvent("onJSGanttLayoutReady", []), this.$layout.render(), t.$container = this.$layout.$container.firstChild, function (t) {
          "static" == window.getComputedStyle(t.$root).getPropertyValue("position") && (t.$root.style.position = "relative");
          var e = document.createElement("iframe");
          e.className = "jsgantt-container-resize-watcher", e.tabIndex = -1, t.$root.appendChild(e), e.contentWindow ? s(t, e.contentWindow) : (t.$root.removeChild(e), s(t, window))
        }(t), this.callEvent("onTemplatesReady", []), this.$mouseEvents.reset(this.$root), this.callEvent("onJSGanttReady", []), this.render()
      }, t.$click = {}, t.render = function () {
        this.callEvent("onBeforeGanttRender", []), !this.config.sort && this._sort && (this._sort = void 0);
        var i = this.getScrollState(), n = i ? i.x : 0;
        this._getHorizontalScrollbar() && (n = this._getHorizontalScrollbar().$config.codeScrollLeft || n || 0);
        var r = null;
        if (n && (r = t.dateFromPos(n + this.config.task_scroll_offset)), e(this), this.$layout.$config.autosize = this.config.autosize, this.$layout.resize(), this.config.preserve_scroll && i && n) {
          var s = t.getScrollState();
          +r == +t.dateFromPos(s.x) && s.y == i.y || (r && this.showDate(r), i.y && t.scrollTo(void 0, i.y))
        }
        this.callEvent("onJSGanttRender", [])
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
        var s = !0;
        return this.checkEvent("onLinkValidation") && (s = this.callEvent("onLinkValidation", [r])), s
      }, t._correct_dst_change = function (e, i, n, s) {
        var a = r.getSecondsInUnit(s) * n;
        if (a > 3600 && a < 86400) {
          var o = e.getTimezoneOffset() - i;
          o && (e = t.date.add(e, o, "minute"))
        }
        return e
      }, t.isSplitTask = function (e) {
        return t.assert(e && e instanceof Object, "Invalid argument"), this.$data.tasksStore._isSplitItem(e)
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
        date: {}
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
    t.exports = function (t) {
    }
  }, function (t, e) {
    function i(t, e) {
      !function (t, e, i) {
        for (var n in e) (void 0 === t[n] || i) && (t[n] = e[n])
      }(e.config, {grid_width: 350, row_height: 23, scale_height: 30, link_line_width: 2, link_arrow_size: 6}, t);
      var i = e.getGridColumns();
      for (i[1] && !e.defined(i[1].width) && (i[1].width = 95), i[2] && !e.defined(i[2].width) && (i[2].width = 80), r = 0; r < i.length; r++) {
        var n = i[r];
        "add" == n.name && (n.width || (n.width = 44), e.defined(n.min_width) && e.defined(n.max_width) || (n.min_width = n.min_width || n.width, n.max_width = n.max_width || n.width), n.min_width && (n.min_width = +n.min_width), n.max_width && (n.max_width = +n.max_width), n.width && (n.width = +n.width, n.width = n.min_width && n.min_width > n.width ? n.min_width : n.width, n.width = n.max_width && n.max_width < n.width ? n.max_width : n.width))
      }
    }

    t.exports = function (t) {
      t.resetSkin || (t.resetSkin = function () {
        i(!0, this)
      }, t.attachEvent("onJSGanttLayoutReady", function () {
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
              for (var e = new Array(arguments.length), r = 0, s = arguments.length; r < s; r++) e[r] = arguments[r];
              if (n.active) {
                var a = n.get_arguments_hash(Array.prototype.slice.call(e));
                n.cache[t] || (n.cache[t] = {});
                var o = n.cache[t];
                if (n.has_cached_value(o, a)) return n.get_cached_value(o, a);
                var l = i.apply(this, e);
                return n.cache_value(o, a, l), l
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
        }, update_if_changed: function (t) {
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
        var n = t.config.types, r = t.locale.labels, s = [], a = i.filter || function (t, e) {
          return !n.placeholder || e !== n.placeholder
        };
        for (var o in n) 0 == !a(o, n[o]) && s.push({key: n[o], label: r["type_" + o]});
        return i.options = s, i.onchange, i.onchange = function () {
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
    }
  }, function (t, e, i) {
    var n = i(2);
    i(11), t.exports = function (t) {
      var e = i(5)(t);

      function r() {
        return e.apply(this, arguments) || this
      }

      return n(r, e), r
    }
  }, function (t, e, i) {
    i(3), i(1), i(11), i(2), t.exports = function (t) {
      i(5)(t)
    }
  }, function (t, e, i) {
    var n = i(2);
    t.exports = function (t) {
      var e = i(12)(t);

      function r() {
        return e.apply(this, arguments) || this
      }

      function s(e, i) {
        var n = [], r = [];
        i && (n = t.getTaskByTime(), e.allow_root && n.unshift({
          id: t.config.root_id,
          col1: e.root_label || ""
        }), n = function (e, i, n) {
          var r = i.filter || function () {
            return !0
          };
          e = e.slice(0);
          for (var s = 0; s < e.length; s++) {
            var a = e[s];
            (a.id == n || t.isChildOf(a.id, n) || !1 === r(a.id, a)) && (e.splice(s, 1), s--)
          }
          return e
        }(n, e, i), e.sort && n.sort(e.sort));
        for (var s = e.template || t.templates.task_text, a = 0; a < n.length; a++) {
          var o = s.apply(t, [n[a].plannedDate, n[a].end_date, n[a]]);
          void 0 === o && (o = ""), r.push({key: n[a].id, label: o})
        }
        return e.options = r, e.map_to = e.map_to || "parent", t.form_blocks.select.render.apply(this, arguments)
      }

      return n(r, e), r.prototype.render = function (t) {
        return s(t, !1)
      }, r.prototype.set_value = function (e, i, n, r) {
        var a = document.createElement("div");
        a.innerHTML = s(r, n.id);
        var o = a.removeChild(a.firstChild);
        return e.onselect = null, e.parentNode.replaceChild(o, e), t.form_blocks.select.set_value.apply(t, [o, i, n, r])
      }, r
    }
  }, function (t, e, i) {
    var n = i(2);
    t.exports = function (t) {
      var e = i(5)(t);

      function r() {
        return e.apply(this, arguments) || this
      }

      return n(r, e), r
    }
  }, function (t, e, i) {
    var n = i(2);
    t.exports = function (t) {
      var e = i(5)(t);

      function r() {
        return e.apply(this, arguments) || this
      }

      return n(r, e), r
    }
  }, function (t, e, i) {
    i(3);
    var n = i(2);
    t.exports = function (t) {
      var e = i(5)(t);

      function r() {
        return e.apply(this, arguments) || this
      }

      return n(r, e), r
    }
  }, function (t, e, i) {
    var n = i(2);
    t.exports = function (t) {
      var e = i(5)(t);

      function r() {
        return e.apply(this, arguments) || this
      }

      return n(r, e), r
    }
  }, function (t, e, i) {
    var n = i(2);
    t.exports = function (t) {
      var e = i(5)(t);

      function r() {
        return e.apply(this, arguments) || this
      }

      return n(r, e), r
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
      var e = i(64)(t), n = i(62)(t), r = i(59)(t), s = i(58)(t);
      t.form_blocks = {template: new e, time: new n, duration: new r, parent: new s}
    }
  }, function (t, e, i) {
    var n = i(3);
    t.exports = function (t) {
      t.isTaskVisible = function (e) {
        if (!this.isTaskExists(e)) return !1;
        var i = this.getTask(e), n = i.plannedDate ? i.plannedDate.valueOf() : null,
          r = i.end_date ? i.end_date.valueOf() : null;
        return !!(n && r && n <= this._max_date.valueOf() && r >= this._min_date.valueOf()) && !!(t.getGlobalTaskIndex(e) >= 0)
      }, t._defaultTaskDate = function (e, i) {
        var n = !(!i || i == t.config.root_id) && t.getTask(i), r = null;
        if (n) r = n.plannedDate; else {
          var s = t.getTaskByIndex(0);
          r = s ? s.plannedDate ? s.plannedDate : s.end_date ? t.calculateEndDate({
            plannedDate: s.end_date,
            duration: -t.config.durationStep,
            task: e
          }) : null : t.config.plannedDate || t.getState().min_date
        }
        return t.assert(r, "Invalid dates"), new Date(r)
      }, t._set_default_task_timing = function (e) {
        e.plannedDate = e.plannedDate || t._defaultTaskDate(e, t.getParent(e)), e.duration = e.duration || t.config.durationStep, e.end_date = e.end_date || t.calculateEndDate(e)
      }, t.createTask = function (e, i, n) {
        return e = e || {}, t.defined(e.id) || (e.id = t.uid()), e.plannedDate || (e.plannedDate = t._defaultTaskDate(e, i)), void 0 === e.col1 && (e.col1 = t.locale.labels.new_task), void 0 === e.duration && (e.duration = 1), this.isTaskExists(i) && (this.setParent(e, i, !0), this.getTask(i).$open = !0), this.callEvent("onTaskCreated", [e]) ? (this.config.details_on_create ? (e.$new = !0, this.silent(function () {
          t.$data.tasksStore.addItem(e, n)
        }), this.selectTask(e.id), this.refreshData()) : this.addTask(e, i, n) && (this.showTask(e.id), this.selectTask(e.id)), e.id) : null
      }, t._update_flags = function (t, e) {
      }, t._get_task_timing_mode = function (t, e) {
        var i = this.getTaskType(t.type), n = {type: i, $no_start: !1, $no_end: !1};
        return e || i != t.$rendered_type ? (i != this.config.types.milestone && (n.$no_end = !(t.end_date || t.duration), n.$no_start = !t.plannedDate), n) : (n.$no_start = t.$no_start, n.$no_end = t.$no_end, n)
      }, t._init_task_timing = function (e) {
        var i = t._get_task_timing_mode(e, !0), n = e.$rendered_type != i.type, r = i.type;
        n && (e.$no_start = i.$no_start, e.$no_end = i.$no_end, e.$rendered_type = i.type), n && r != this.config.types.milestone && this._set_default_task_timing(e), r == this.config.types.milestone && (e.end_date = e.plannedDate), e.plannedDate && e.end_date && (e.duration = this.calculateDuration(e)), e.end_date || (e.end_date = e.plannedDate), e.duration = e.duration || 0
      }, t.isSummaryTask = function (e) {
        t.assert(e && e instanceof Object, "Invalid argument");
        var i = t._get_task_timing_mode(e);
        return !(!i.$no_end && !i.$no_start)
      }, t.getSubtaskDuration = function (e) {
        var i = 0, n = void 0 !== e ? e : t.config.root_id;
        return this.eachTask(function (t) {
          i += t.duration
        }, n), i
      }, t.getSubtaskDates = function (e) {
        var i = null, n = null, r = void 0 !== e ? e : t.config.root_id;
        return this.eachTask(function (t) {
          t.plannedDate && !t.$no_start && (!i || i > t.plannedDate.valueOf()) && (i = t.plannedDate.valueOf()), t.end_date && !t.$no_end && (!n || n < t.end_date.valueOf()) && (n = t.end_date.valueOf())
        }, r), {plannedDate: i ? new Date(i) : null, end_date: n ? new Date(n) : null}
      }, t._update_parents = function (t, e) {
        if (t) {
          var i = this.getTask(t), n = this.getParent(i), r = this._get_task_timing_mode(i), s = !0;
          if (r.$no_start || r.$no_end) {
            var a = i.plannedDate.valueOf(), o = i.end_date.valueOf();
            a == i.plannedDate.valueOf() && o == i.end_date.valueOf() && (s = !1), s && !e && this.refreshTask(i.id, !0)
          }
          s && n && this.isTaskExists(n) && this._update_parents(n, e)
        }
      }, t.roundDate = function (e) {
        var i = t.getScale();
        n.isDate(e) && (e = {
          date: e,
          unit: i ? i.unit : t.config.durationUnit,
          step: i ? i.step : t.config.durationStep
        });
        var r, s, a, o = e.date, l = e.step, c = e.unit;
        if (!i) return o;
        if (c == i.unit && l == i.step && +o >= +i.min_date && +o <= +i.max_date) a = Math.floor(t.columnIndexByDate(o)), i.trace_x[a] || (a -= 1, i.rtl && (a = 0)), s = new Date(i.trace_x[a]), r = t.date.add(s, l, c); else {
          for (a = Math.floor(t.columnIndexByDate(o)), r = t.date[c + "_start"](new Date(i.min_date)), i.trace_x[a] && (r = t.date[c + "_start"](i.trace_x[a])); +r < +o;) {
            var h = (r = t.date[c + "_start"](t.date.add(r, l, c))).getTimezoneOffset();
            r = t._correct_dst_change(r, h, r, c), t.date[c + "_start"] && (r = t.date[c + "_start"](r))
          }
          s = t.date.add(r, -1 * l, c)
        }
        return e.dir && "future" == e.dir ? r : e.dir && "past" == e.dir ? s : Math.abs(o - s) < Math.abs(r - o) ? s : r
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
    i(0), t.exports = {
      create: function (t, e) {
        return {
          getWorkHours: function (t) {
            return e.getWorkHours(t)
          }, setWorkTime: function (t) {
            return e.setWorkTime(t)
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
      }, isWorkTime: function () {
        return !0
      }, getClosestWorkTime: function (t) {
        return this.argumentsHelper.getClosestWorkTimeArguments.apply(this.argumentsHelper, arguments).date
      }, calculateDuration: function () {
        var t = this.argumentsHelper.getDurationArguments.apply(this.argumentsHelper, arguments), e = t.plannedDate,
          i = t.end_date, n = t.unit, r = t.step;
        return this._calculateDuration(e, i, n, r)
      }, _calculateDuration: function (t, e, i, n) {
        var r = this.$jsgantt.date, s = {week: 6048e5, day: 864e5, hour: 36e5, minute: 6e4}, a = 0;
        if (s[i]) a = Math.round((e - t) / (n * s[i])); else {
          for (var o = new Date(t), l = new Date(e); o.valueOf() < l.valueOf();) a += 1, o = r.add(o, n, i);
          o.valueOf() != e.valueOf() && (a += (l - o) / (r.add(o, n, i) - o))
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

    function s(t) {
      this.$jsgantt = t.$jsgantt, this.argumentsHelper = n(this.$jsgantt), this.calendarManager = t, this.$disabledCalendar = new r(this.$jsgantt, this.argumentsHelper)
    }

    s.prototype = {
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
    }, t.exports = s
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

    function s(t, e) {
      this.argumentsHelper = e, this.$jsgantt = t, this._workingUnitsCache = n.createCacheObject()
    }

    s.prototype = {
      units: ["year", "month", "week", "day", "hour", "minute"], _getUnitOrder: function (t) {
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
        var r = this.$jsgantt.date, s = new Date(t), a = new Date(e);
        n = n || 1;
        var o, l, c = 0, h = null, d = !1;
        (o = r[i + "_start"](new Date(s))).valueOf() != s.valueOf() && (d = !0);
        var u = !1;
        (l = r[i + "_start"](new Date(e))).valueOf() != e.valueOf() && (u = !0);
        for (var f = !1; s.valueOf() < a.valueOf();) f = (h = this._nextDate(s, i, n)).valueOf() > a.valueOf(), this._isWorkTime(s, i) && ((d || u && f) && (o = r[i + "_start"](new Date(s)), l = r.add(o, n, i)), d ? (d = !1, h = this._nextDate(o, i, n), c += (l.valueOf() - s.valueOf()) / (l.valueOf() - o.valueOf())) : u && f ? (u = !1, c += (a.valueOf() - s.valueOf()) / (l.valueOf() - o.valueOf())) : c++), s = h;
        return c
      }, _getMinutesPerDay: function (t) {
        return 60 * this._getHoursPerDay(t)
      }, _getHoursPerDay: function (t) {
        for (var e = this._getWorkHours(t), i = 0, n = 0; n < e.length; n += 2) i += e[n + 1] - e[n] || 0;
        return i
      }, _getWorkUnitsForRange: function (t, e, i, n) {
        var s, a = 0, o = new Date(t), l = new Date(e);
        for (s = "minute" == i ? r.bind(this._getMinutesPerDay, this) : r.bind(this._getHoursPerDay, this); o.valueOf() < l.valueOf();) this._isWorkTime(o, "day") && (a += s(o)), o = this._nextDate(o, "day", 1);
        return a / n
      }, _getWorkUnitsBetweenQuick: function (t, e, i, n) {
        var r = new Date(t), s = new Date(e);
        n = n || 1;
        var a = new Date(r), o = this.$jsgantt.date.add(this.$jsgantt.date.dayStart(new Date(r)), 1, "day");
        if (s.valueOf() <= o.valueOf()) return this._getWorkUnitsBetweenGeneric(t, e, i, n);
        var l = this.$jsgantt.date.dayStart(new Date(s)), c = s, h = this._getWorkUnitsBetweenGeneric(a, o, i, n),
          d = this._getWorkUnitsBetweenGeneric(l, c, i, n);
        return h + this._getWorkUnitsForRange(o, l, i, n) + d
      }, _getCalendar: function () {
        return this.worktime
      }, _setCalendar: function (t) {
        this.worktime = t
      }, getWorkHours: function () {
        var t = this.argumentsHelper.getWorkHoursArguments.apply(this.argumentsHelper, arguments);
        return this._getWorkHours(t.date)
      }, _getWorkHours: function (t) {
        var e = this._timestamp({date: t}), i = !0, n = this._getCalendar();
        return void 0 !== n.dates[e] ? i = n.dates[e] : void 0 !== n.dates[t.getDay()] && (i = n.dates[t.getDay()]), !0 === i ? n.hours : i || []
      }, setWorkTime: function (t) {
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
        var s = new Date(e), a = new Date(i);
        for (r = r || 1; s.valueOf() < a.valueOf();) {
          if (this._isWorkTime(s, n)) return !0;
          s = this._nextDate(s, n, r)
        }
        return !1
      }, calculateEndDate: function () {
        var t = this.argumentsHelper.calculateEndDateArguments.apply(this.argumentsHelper, arguments),
          e = t.plannedDate, i = t.duration, n = t.unit, r = t.step;
        if (!n) return !1;
        var s = t.duration >= 0 ? 1 : -1;
        return i = Math.abs(1 * i), this._calculateEndDate(e, i, n, r * s)
      }, _calculateEndDate: function (t, e, i, n) {
        return !!i && (1 == n && "minute" == i ? this._calculateMinuteEndDate(t, e, n) : 1 == n && "hour" == i ? this._calculateHourEndDate(t, e, n) : this._addInterval(t, e, i, n, null).end)
      }, _addInterval: function (t, e, i, n, r) {
        for (var s = 0, a = t; s < e && (!r || !r(a));) {
          var o = this._nextDate(a, i, n);
          this._isWorkTime(n > 0 ? new Date(o.valueOf() - 1) : new Date(o.valueOf() + 1), i) && s++, a = o
        }
        return {end: a, satrt: t, added: s}
      }, _calculateHourEndDate: function (t, e, i) {
        var n = new Date(t), r = 0;
        i = i || 1, e = Math.abs(1 * e);
        var s = this._addInterval(n, e, "hour", i, function (t) {
          return !(t.getHours() || t.getMinutes() || t.getSeconds() || t.getMilliseconds())
        });
        if (r = s.added, n = s.end, (c = e - r) && c > 24) {
          for (var a = n; r < e;) {
            var o = this._nextDate(a, "day", i);
            if (this._isWorkTime(i > 0 ? new Date(o.valueOf() - 1) : new Date(o.valueOf() + 1), "day")) {
              var l = this._getHoursPerDay(a);
              if (r + l >= e) break;
              r += l
            }
            a = o
          }
          n = a
        }
        if (r < e) {
          var c = e - r;
          n = (s = this._addInterval(n, c, "hour", i, null)).end
        }
        return n
      }, _calculateMinuteEndDate: function (t, e, i) {
        var n = new Date(t), r = 0;
        i = i || 1, e = Math.abs(1 * e);
        var s = this._addInterval(n, e, "minute", i, function (t) {
          return !(t.getMinutes() || t.getSeconds() || t.getMilliseconds())
        });
        if (r = s.added, n = s.end, r < e) {
          var a = e - r, o = Math.floor(a / 60);
          o && (n = this._calculateEndDate(n, o, "hour", i > 0 ? 1 : -1), r += 60 * o)
        }
        if (r < e) {
          var l = e - r;
          n = (s = this._addInterval(n, l, "minute", i, null)).end
        }
        return n
      }, getClosestWorkTime: function () {
        var t = this.argumentsHelper.getClosestWorkTimeArguments.apply(this.argumentsHelper, arguments);
        return this._getClosestWorkTime(t.date, t.unit, t.dir)
      }, _getClosestWorkTime: function (t, e, i) {
        var n = new Date(t);
        if (this._isWorkTime(n, e)) return n;
        if (n = this.$jsgantt.date[e + "_start"](n), "any" != i && i) n = "past" == i ? this._getClosestWorkTimePast(n, e) : this._getClosestWorkTimeFuture(n, e); else {
          var r = this._getClosestWorkTimeFuture(n, e), s = this._getClosestWorkTimePast(n, e);
          n = Math.abs(r - t) <= Math.abs(t - s) ? r : s
        }
        return n
      }, _getClosestWorkTimeFuture: function (t, e) {
        return this._getClosestWorkTimeGeneric(t, e, 1)
      }, _getClosestWorkTimePast: function (t, e) {
        var i = this._getClosestWorkTimeGeneric(t, e, -1);
        return this.$jsgantt.date.add(i, 1, e)
      }, _getClosestWorkTimeGeneric: function (t, e, i) {
        for (var n = this._getUnitOrder(e), r = this.units[n - 1], s = t, a = 0; !this._isWorkTime(s, e) && (!r || this._isWorkTime(s, r) || (s = this._getClosestWorkTimeGeneric(s, r, i), !this._isWorkTime(s, e)));) {
          if (++a > 3e3) return this.$jsgantt.assert(!1, "Invalid working time check"), !1;
          var o = s.getTimezoneOffset();
          s = this.$jsgantt.date.add(s, i, e), s = this.$jsgantt._correct_dst_change(s, o, i, e), this.$jsgantt.date[e + "_start"] && (s = this.$jsgantt.date[e + "_start"](s))
        }
        return s
      }
    }, t.exports = s
  }, function (t, e, i) {
    i(0), i(24), i(73), t.exports = function (t) {
      this.$jsgantt = t
    }
  }, function (t, e, i) {
    var n = i(74), r = i(69), s = i(67), a = i(0);
    t.exports = function (t) {
      var e = new n(t), i = new r(e), o = s.create(e, i);
      a.mixin(t, o)
    }
  }, function (t, e, i) {
    var n = i(3);
    t.exports = function (t) {
      t.load = function (t, e, i) {
        this._load_url = t, this.assert(arguments.length, "Invalid load arguments");
        var n = "json";
        return arguments.length >= 3 ? n = e : "string" == typeof arguments[1] ? n = arguments[1] : "function" == typeof arguments[1] && arguments[1], this._load_type = n, this.callEvent("onLoadStart", [t, n])
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
          for (var s = 0; s < n.length; s++) {
            var a = n[s], o = this.copy(a);
            for (var l in o.key = o.value, a) if (a.hasOwnProperty(l)) {
              if ("value" == l || "label" == l) continue;
              o[l] = a[l]
            }
            r.push(o)
          }
        }
        e && this.callEvent("onOptionsLoad", [])
      }, t.attachEvent("onBeforeTaskDisplay", function (t, e) {
        return !e.$ignore
      }), t.json = {
        parse: function (e) {
          return t.assert(e, "Invalid data"), "string" == typeof e && (window.JSON ? e = JSON.parse(e) : t.assert(!1, "JSON is not supported")), e
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
          t.eachTask(function (t) {
            e.push(this.serializeTask(t))
          }, t.config.root_id, this);
          for (var n = t.getLinks(), r = 0; r < n.length; r++) i.push(this.serializeLink(n[r]));
          return {data: e, links: i}
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

      function s(t) {
        return (t + "").replace(r, "&#39;")
      }

      for (var a in t._waiAria = {
        getAttributeString: function (t) {
          var e = [" "];
          for (var i in t) {
            var r = s(n(t[i]));
            e.push(i + "='" + r + "'")
          }
          return e.push(" "), e.join(" ")
        }, getTimelineCellAttr: function (e) {
          return t._waiAria.getAttributeString({"aria-label": e})
        }, _taskCommonAttr: function (e, i) {
          e.plannedDate && e.end_date && (t.isReadonly(e) && i.setAttribute("aria-readonly", !0), e.$dataprocessor_class && i.setAttribute("aria-busy", !0), i.setAttribute("aria-selected", t.getState().selected_task == e.id || t.isSelectedTask && t.isSelectedTask(e.id) ? "true" : "false"))
        }, setTaskBarAttr: function (e, i) {
          this._taskCommonAttr(e, i), !t.isReadonly(e) && t.config.drag_move && (e.id != t.getState().drag_id ? i.setAttribute("aria-grabbed", !1) : i.setAttribute("aria-grabbed", !0))
        }, taskRowAttr: function (e, i) {
          this._taskCommonAttr(e, i), !t.isReadonly(e) && t.config.order_branch && i.setAttribute("aria-grabbed", !1), i.setAttribute("role", "row"), i.setAttribute("aria-level", e.$level), t.hasChild(e.id) && i.setAttribute("aria-expanded", e.$open ? "true" : "false")
        }, linkAttr: function (e, i) {
          var r = t.config.links, s = e.type == r.finish_to_start || e.type == r.start_to_start,
            a = e.type == r.start_to_start || e.type == r.start_to_finish,
            o = t.locale.labels.link + " " + t.templates.drag_link(e.source, a, e.target, s);
          i.setAttribute("aria-label", n(o)), t.isReadonly(e) && i.setAttribute("aria-readonly", !0)
        }, gridSeparatorAttr: function (t) {
          t.setAttribute("role", "separator")
        }, gridAttrString: function () {
          return [" role='treegrid'", "aria-multiselectable='false'", " "].join(" ")
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
          var i = t._load_url, n = (i = i.replace(/([?&])?parent_id=.+&?/, "")).indexOf("?") >= 0 ? "&" : "?",
            r = t.getScrollState().y || 0;
          t.load(i + n + "parent_id=" + encodeURIComponent(e), this._load_type, function () {
            r && t.scrollTo(null, r)
          }), t.setUserData(e, "was_rendered", !0)
        }
      })
    }
  }, function (t, e) {
    t.exports = function (t) {
      function e(e, i) {
        e.type = i, t.updateTask(e.id)
      }

      function i(e) {
        var i = t.config.types, n = t.hasChild(e.id), r = t.getTaskType(e.type);
        return n && r === i.task ? i.project : !n && !1
      }

      t.attachEvent("onParse", function (e) {
        return function () {
          return !t.config.auto_types || e.apply(this, arguments)
        }
      }(function () {
        !1, t.batchUpdate(function () {
          t.eachTask(function (t) {
            var n = i(t);
            !1 !== n && e(t, n)
          })
        }), !0
      }))
    }
  }, function (t, e) {
    t.exports = function (t) {
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
          for (var s, a = r.join("_") + "_" + i, o = {}, l = 0; l < r.length; l++) o[r[l]] = !0;
          return e[a] ? s = e[a] : (s = e[a] = [], t.eachTask(function (t) {
            var e;
            e = n.isArray(t[i]) ? t[i] : [t[i]], n.forEach(e, function (e) {
              e && (o[e] || o[e.resource_id]) && s.push(t)
            })
          })), s
        }

        function s(n, r, s, a) {
          var o = n.id + "_" + r + "_" + s.unit + "_" + s.step;
          return e[o] ? e[o] : e[o] = function (e, n, r, s) {
            _ = "task" == e.$role ? [] : i(n, e.id);
            for (var a = r.unit, o = {}, l = 0; l < _.length; l++) for (var c = _[l], h = t.date[a + "_start"](new Date(c.plannedDate)); h < c.end_date;) {
              var d = h;
              if (h = t.date.add(h, 1, a), t.isWorkTime({date: d, task: c, unit: a})) {
                var u = d.valueOf();
                o[u] || (o[u] = []), o[u].push(c)
              }
            }
            var f, g, _, p = [], v = s.$getConfig();
            for (l = 0; l < r.trace_x.length; l++) f = new Date(r.trace_x[l]), g = t.date.add(f, 1, a), ((_ = o[f.valueOf()] || []).length || v.resource_render_empty_cells) && p.push({
              plannedDate: f,
              end_date: g,
              tasks: _
            });
            return p
          }(n, r, s, a)
        }

        function a(t, e, i, n) {
          var r = 100 * (1 - (1 * t || 0)), s = n.posFromDate(e), a = n.posFromDate(i),
            o = document.createElement("div");
          return o.className = "jsgantt-histogram-hor-bar", o.style.top = r + "%", o.style.left = s + "px", o.style.width = a - s + 1 + "px", o
        }

        function o(t, e, i) {
          if (t === e) return null;
          var n = 1 - Math.max(t, e), r = Math.abs(t - e), s = document.createElement("div");
          return s.className = "jsgantt-histogram-vert-bar", s.style.top = 100 * n + "%", s.style.height = 100 * r + "%", s.style.left = i + "px", s
        }

        function l(e, i, n) {
          var r = t.config.resource_property, s = [];
          if (t.getDatastore("task").exists(i)) {
            var a = t.getTask(i);
            s = a[r] || []
          }
          Array.isArray(s) || (s = [s]);
          for (var o = 0; o < s.length; o++) s[o].resource_id == e && n.push({
            task_id: a.id,
            resource_id: s[o].resource_id,
            value: s[o].value
          })
        }

        return t.$data.tasksStore.attachEvent("onStoreUpdated", function () {
          e = {}
        }), {
          renderLine: function (t, e) {
            for (var i = e.$getConfig(), n = e.$getTemplates(), r = s(t, i.resource_property, e.getScale(), e), a = [], o = 0; o < r.length; o++) {
              var l = r[o], c = n.resource_cell_class(l.plannedDate, l.end_date, t, l.tasks),
                h = n.resource_cell_value(l.plannedDate, l.end_date, t, l.tasks);
              if (c || h) {
                var d = e.getItemPosition(t, l.plannedDate, l.end_date), u = document.createElement("div");
                u.className = ["jsgantt-resource-marker", c].join(" "), u.style.cssText = ["left:" + d.left + "px", "width:" + d.width + "px", "height:" + (i.row_height - 1) + "px", "line-height:" + (i.row_height - 1) + "px", "top:" + d.top + "px"].join(";"), h && (u.innerHTML = h), a.push(u)
              }
            }
            var f = null;
            if (a.length) for (f = document.createElement("div"), o = 0; o < a.length; o++) f.appendChild(a[o]);
            return f
          }, renderHistogram: function (e, i) {
            for (var n = i.$getConfig(), r = i.$getTemplates(), l = s(e, n.resource_property, i.getScale(), i), c = [], h = {}, d = e.capacity || i.$config.capacity || 24, u = 0; u < l.length; u++) {
              var f = l[u], g = r.histogram_cell_class(f.plannedDate, f.end_date, e, f.tasks),
                _ = r.histogram_cell_label(f.plannedDate, f.end_date, e, f.tasks),
                p = r.histogram_cell_allocated(f.plannedDate, f.end_date, e, f.tasks),
                v = r.histogram_cell_capacity(f.plannedDate, f.end_date, e, f.tasks);
              if (h[f.plannedDate.valueOf()] = v || 0, g || _) {
                var m = i.getItemPosition(e, f.plannedDate, f.end_date), $ = document.createElement("div");
                $.className = ["jsgantt-histogram-cell", g].join(" "), $.style.cssText = ["left:" + m.left + "px", "width:" + m.width + "px", "height:" + (n.row_height - 1) + "px", "line-height:" + (n.row_height - 1) + "px", "top:" + (m.top + 1) + "px"].join(";"), _ && (_ = "<div class='jsgantt-histogram_label'>" + _ + "</div>"), p && (_ = "<div class='jsgantt-histogram-fill' style='height:" + 100 * Math.min(p / d || 0, 1) + "%;'></div>" + _), _ && ($.innerHTML = _), c.push($)
              }
            }
            var y = null;
            if (c.length) {
              for (y = document.createElement("div"), u = 0; u < c.length; u++) y.appendChild(c[u]);
              var w = function (e, i, n) {
                for (var r = i.getScale(), s = document.createElement("div"), l = 0; l < r.trace_x.length; l++) {
                  var c = r.trace_x[l], h = r.trace_x[l + 1] || t.date.add(c, r.step, r.unit),
                    d = r.trace_x[l].valueOf(), u = Math.min(e[d] / n, 1) || 0;
                  if (u < 0) return null;
                  var f = Math.min(e[h.valueOf()] / n, 1) || 0, g = a(u, c, h, i);
                  g && s.appendChild(g);
                  var _ = o(u, f, i.posFromDate(h));
                  _ && s.appendChild(_)
                }
                return s
              }(h, i, d);
              w && (w.setAttribute("data-resource-id", e.id), w.style.position = "absolute", w.style.top = m.top + 1 + "px", w.style.height = n.row_height - 1 + "px", w.style.left = 0, y.appendChild(w))
            }
            return y
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
    t.exports = null
  }, function (t, e) {
    t.exports = null
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
              var s = t.getChildren(n), a = 1 * i[r] - 1;
              if (!t.isTaskExists(s[a])) return null;
              n = s[a]
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
                  var s = t.getParent(i.id);
                  this._setWBSCode(i, t.getTask(s).$wbs + ".1")
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
      }, t.attachEvent("onBeforeParse", i), t.attachEvent("onAfterSort", i)
    }
  }, function (t, e) {
    t.exports = function (t) {
      t.batchUpdate = function (t) {
        var e = !1;
        return t.$services.getService("state").registerProvider("batchUpdate", function () {
          return {batch_update: e}
        }, !0), function (t, i) {
          if (e) !function (t) {
            try {
              t()
            } catch (t) {
              window.console.error(t)
            }
          }(t); else {
            var n, r = this._dp && "off" != this._dp.updateMode;
            r && (n = this._dp.updateMode, this._dp.setUpdateMode("off")), e = !1, i || this.render(), r && (this._dp.setUpdateMode(n), this._dp.setGanttMode("task"), this._dp.sendData(), this._dp.setGanttMode("link"), this._dp.sendData())
          }
        }
      }(t)
    }
  }, function (t, e, i) {
    i(1);
    t.exports = function (t) {
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
        this.$dp, this.$jsgantt, i(25)
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
    i(4), i(3), i(0), i(92), i(91)
  }, function (t, e, i) {
    i(93)
  }, function (t, e) {
    t.exports = {
      bindDataStore: function (t, e) {
        var i = e.getDatastore(t), n = function (t, e) {
          var n = e.getLayers(), r = i.getItem(t);
          if (r && i.isVisible(t)) for (var s = 0; s < n.length; s++) n[s].render_item(r)
        };

        function r(t) {
          return !!t.$services.getService("state").getState("batchUpdate").batch_update
        }

        i.attachEvent("onStoreUpdated", function (s, a, o) {
          if (!r(e)) {
            var l = e.$services.getService("layers").getDataRender(t);
            l && (s && "move" != o && "delete" != o ? (i.callEvent("onBeforeRefreshItem", [a.id]), n(a.id, l), i.callEvent("onAfterRefreshItem", [a.id])) : (i.callEvent("onBeforeRefreshAll", []), function (t) {
              for (var e = l.getLayers(), n = 0; n < e.length; n++) e[n].clear();
              var r = i.getVisibleItems();
              for (n = 0; n < e.length; n++) e[n].render_items(r)
            }(), i.callEvent("onAfterRefreshAll", [])))
          }
        }), i.attachEvent("onItemOpen", function () {
          e.render()
        }), i.attachEvent("onItemClose", function () {
          e.render()
        }), i.attachEvent("onIdChange", function (s, a) {
          if (i.callEvent("onBeforeIdChange", [s, a]), !r(e)) {
            var o = e.$services.getService("layers").getDataRender(t);
            !function (t, e, i, n) {
              for (var r = 0; r < t.length; r++) t[r].change_id(e, i)
            }(o.getLayers(), s, a, i.getItem(a)), n(a, o)
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
        getLink: function (t) {
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
          this.assert(t, "Invalid argument");
          var e = this.$data.tasksStore.getItem(t);
          return this.assert(e, "Task not found id=" + t), e
        }, getTaskByTime: function (t, e) {
          var i = this.$data.tasksStore.getItems(), n = [];
          if (t || e) {
            t = +t || -1 / 0, e = +e || 1 / 0;
            for (var r = 0; r < i.length; r++) {
              var s = i[r];
              +s.plannedDate < e && +s.end_date > t && n.push(s)
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
            var s = this.getLink(n[r]);
            s.source == t && (s.source = e), s.target == t && (s.target = e)
          }
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
        }, sort: function (t, e, i, n) {
          var r = !n;
          this.$data.tasksStore.sort(t, e, i), r && this.render(), this.callEvent("onAfterSort", [t, e, i])
        }
      }
    }
  }, function (t, e, i) {
    var n = i(0), r = i(98), s = i(97), a = i(29), o = i(27), l = i(96), c = i(95);

    function h() {
      for (var t = this.$services.getService("datastores"), e = [], i = 0; i < t.length; i++) e.push(this.getDatastore(t[i]));
      return e
    }

    t.exports = {
      create: function () {
        var t = n.mixin({}, {
          createDatastore: function (t) {
            var e = "treedatastore" == (t.type || "").toLowerCase() ? o : a;
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
            for (var e = h.call(this), i = 0; i < e.length; i++) e[i].refresh();
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
            for (var t = h.call(this), e = 0; e < t.length; e++) t[e].clearAll();
            this._update_flags(), this.userdata = {}, this.callEvent("onClear", []), this.render()
          }, selectTask: function (t) {
            var e = this.$data.tasksStore;
            return !!this.config.select_task && (t && e.select(t), e.getSelectedId())
          }, getSelectedId: function () {
            return this.$data.tasksStore.getSelectedId()
          }
        });
        return n.mixin(t, r()), n.mixin(t, s()), t
      }
    }
  }, function (t, e, i) {
    var n = i(0), r = i(99);
    i(26);
    t.exports = function (t) {
      var e = r.create();
      n.mixin(t, e);
      var i = t.createDatastore({
        name: "task", type: "treeDatastore", rootId: function () {
          return t.config.root_id
        }, initItem: n.bind(function (e) {
          this.defined(e.id) || (e.id = this.uid()), e.plannedDate && (e.plannedDate = t.date.parseDate(e.plannedDate, "dateFormat")), e.end_date && (e.end_date = t.date.parseDate(e.end_date, "dateFormat"));
          var i = null;
          return (e.duration || 0 === e.duration) && (e.duration = i = 1 * e.duration), i && (e.plannedDate && !e.end_date ? e.end_date = this.calculateEndDate(e) : !e.plannedDate && e.end_date && (e.plannedDate = this.calculateEndDate({
            plannedDate: e.end_date,
            duration: -e.duration,
            task: e
          }))), e.progress = Number(e.progress) || 0, this._init_task_timing(e), e.plannedDate && e.end_date && this.correctTaskWorkTime(e), e.$source = [], e.$target = [], void 0 === e.parent && this.setParent(e, this.config.root_id), e
        }, t)
      }), s = t.createDatastore({
        name: "link", initItem: n.bind(function (t) {
          return this.defined(t.id) || (t.id = this.uid()), t
        }, t)
      });

      function a(e) {
        if (t.isTaskExists(e.source)) {
          var i = t.getTask(e.source);
          i.$source = i.$source || [], i.$source.push(e.id)
        }
        if (t.isTaskExists(e.target)) {
          var n = t.getTask(e.target);
          n.$target = n.$target || [], n.$target.push(e.id)
        }
      }

      function o(t) {
        var e = t.source, i = t.target;
        for (var n in t.events) !function (t, n) {
          e.attachEvent(t, function () {
            return i.callEvent(n, Array.prototype.slice.call(arguments))
          }, n)
        }(n, t.events[n])
      }

      i.attachEvent("onBeforeRefreshAll", function () {
        for (var t = i.getVisibleItems(), e = 0; e < t.length; e++) t[e].$index = e
      }), i.attachEvent("onFilterItem", function (e, i) {
        var n = null, r = null;
        return !(t.config.plannedDate && t.config.end_date && (n = t.config.plannedDate.valueOf(), r = t.config.end_date.valueOf(), +i.plannedDate > r || +i.end_date < +n))
      }), i.attachEvent("onIdChange", function (e, i) {
        t._update_flags(e, i)
      }), i.attachEvent("onAfterUpdate", function (e) {
        if (t._update_parents(e), t.getState("batchUpdate").batch_update) return !0;
        for (var n = i.getItem(e), r = 0; r < n.$source.length; r++) s.refresh(n.$source[r]);
        for (r = 0; r < n.$target.length; r++) s.refresh(n.$target[r])
      }), i.attachEvent("onAfterItemMove", function (e, i, n) {
        var r = t.getTask(e);
        null !== this.getNextSibling(e) ? r.$drop_target = this.getNextSibling(e) : null !== this.getPrevSibling(e) ? r.$drop_target = "next:" + this.getPrevSibling(e) : r.$drop_target = "next:null"
      }), t.attachEvent("onParse", function () {
        for (var e = null, i = t.$data.tasksStore.getItems(), n = 0, r = i.length; n < r; n++) (e = i[n]).$source = [], e.$target = [];
        var s = t.$data.linksStore.getItems();
        for (n = 0, r = s.length; n < r; n++) a(s[n])
      }), o({source: s, target: t, events: {}}), o({source: i, target: t, events: {}}), t.$data = {
        tasksStore: i,
        linksStore: s
      }
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

      function s(t, e, i, n) {
        var s = t(this);
        return s && s.isVisible() ? s[e].apply(s, i) : n ? n() : r
      }

      return {
        getColumnIndex: function (t) {
          var i = s.call(this, e, "getColumnIndex", [t]);
          return i === r ? 0 : i
        }, dateFromPos: function (e) {
          var i = s.call(this, t, "dateFromPos", Array.prototype.slice.call(arguments));
          return i === r ? this.getState().min_date : i
        }, posFromDate: function (e) {
          var i = s.call(this, t, "posFromDate", [e]);
          return i === r ? 0 : i
        }, getRowTop: function (i) {
          var n = this, a = s.call(n, t, "getRowTop", [i], function () {
            return s.call(n, e, "getRowTop", [i])
          });
          return a === r ? 0 : a
        }, getTaskTop: function (i) {
          var n = this, a = s.call(n, t, "getItemTop", [i], function () {
            return s.call(n, e, "getItemTop", [i])
          });
          return a === r ? 0 : a
        }, getTaskPosition: function (e, i, n) {
          var a = s.call(this, t, "getItemPosition", [e, i, n]);
          return a === r ? {left: 0, top: this.getTaskTop(e.id), height: this.getTaskHeight(), width: 0} : a
        }, getTaskHeight: function () {
          var i = this, n = s.call(i, t, "getItemHeight", [], function () {
            return s.call(i, e, "getItemHeight", [])
          });
          return n === r ? 0 : n
        }, columnIndexByDate: function (e) {
          var i = s.call(this, t, "columnIndexByDate", [e]);
          return i === r ? 0 : i
        }, roundTaskDates: function () {
          s.call(this, t, "roundTaskDates", [])
        }, getScale: function () {
          var e = s.call(this, t, "getScale", []);
          return e === r ? null : e
        }, getTaskNode: function (e) {
          var i = t(this);
          return i && i.isVisible() ? i._taskRenderer.rendered[e] : null
        }, getLinkNode: function (e) {
          var i = t(this);
          return i.isVisible() ? i._linkRenderer.rendered[e] : null
        }, scrollTo: function (t, e) {
          var r = i(this), s = n(this), a = {position: 0}, o = {position: 0};
          r && (o = r.getScrollState()), s && (a = s.getScrollState()), s && 1 * t == t && s.scroll(t), r && 1 * e == e && r.scroll(e);
          var l = {position: 0}, c = {position: 0};
          r && (l = r.getScrollState()), s && (c = s.getScrollState()), this.callEvent("onJSGanttScroll", [a.position, o.position, c.position, l.position])
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
            var s = r.getScrollState();
            s.visible && (t.x = s.size, t.x_inner = s.scrollSize), t.x_pos = s.position || 0
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
            var n = e[i], r = !1, s = n.$parent.getPrevSibling(n.$id);
            if (s && s.$config && "grid" === s.$config.id) r = !0; else {
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
            var s = t.$ui.getView("grid");
            if (s) {
              var a = t.config.show_grid;
              if (i) {
                var o = s._getColsTotalWidth();
                !1 !== o && (t.config.grid_width = o), a = a && !!t.config.grid_width, t.config.show_grid = a
              }
              if (s.$config.hidden = s.$parent.$config.hidden = !a, !s.$config.hidden) {
                var l = s._getGridWidthLimits();
                if (l[0] && t.config.grid_width < l[0] && (t.config.grid_width = l[0]), l[1] && t.config.grid_width > l[1] && (t.config.grid_width = l[1]), r && t.config.show_chart) if (s.$config.width = t.config.grid_width - 1, i) s.$parent.$config.width = t.config.grid_width, s.$parent.$config.group && t.$layout._syncCellSizes(s.$parent.$config.group, s.$parent.$config.width); else if (r && !n.isChildOf(r.$task, e.$view)) {
                  if (!s.$config.original_grid_width) {
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
                    c && c.config && c.config.grid_width ? s.$config.original_grid_width = c.config.grid_width : s.$config.original_grid_width = 0
                  }
                  t.config.grid_width = s.$config.original_grid_width, s.$parent.$config.width = t.config.grid_width
                } else s.$parent._setContentSize(s.$config.width, s.$config.height), t.$layout._syncCellSizes(s.$parent.$config.group, t.config.grid_width); else r && n.isChildOf(r.$task, e.$view) && (s.$config.original_grid_width = t.config.grid_width), i || (s.$parent.$config.width = 0)
              }
              i = !1
            }
          }), this._initScrollStateEvents(e)
        }, _initScrollStateEvents: function (e) {
          t._getVerticalScrollbar = this.getVerticalScrollbar, t._getHorizontalScrollbar = this.getHorizontalScrollbar;
          var i = this.getVerticalScrollbar(), n = this.getHorizontalScrollbar();
          i && i.attachEvent("onScroll", function (e, i, n) {
            var r = t.getScrollState();
            t.callEvent("onJSGanttScroll", [r.x, e, r.x, i])
          }), n && n.attachEvent("onScroll", function (e, i, n) {
            var r = t.getScrollState();
            t.callEvent("onJSGanttScroll", [e, r.y, i, r.y])
          }), e.attachEvent("onPanelResize", function () {
            i && !t.$scroll_ver && (t.$scroll_ver = i.$scroll_ver), n && !t.$scroll_hor && (t.$scroll_hor = n.$scroll_hor)
          })
        }, _findGridResizer: function (t, e) {
          for (var i, n = t.getCellsByType("resizer"), r = !0, s = 0; s < n.length; s++) {
            var a = n[s];
            a._getSiblings();
            var o = a._behind, l = a._front;
            if (o && o.$content === e || o.isChild && o.isChild(e)) {
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
            let e = 0;
            var r, s = n.gridFirst, a = n.resizer;
            a.attachEvent("onPanelResizeStart", function (e, i) {
              var n = t.$ui.getView("grid"), a = n ? n.$parent : null;
              if (a) {
                var o = n._getGridWidthLimits();
                n.$config.scrollable || (a.$config.minWidth = o[0]), a.$config.maxWidth = o[1]
              }
              return r = s ? e : i
            }), a.attachEvent("onPanelResize", function (i, n) {
              var a = s ? i : n;
              const o = $(".timeline-cell");
              return 0 == e && (e = o.width()), $(".grid-cell.jsgantt-layout-outer-scroll.jsgantt-layout-cell-border-right").css({width: a + "px"}), $(".scrollHor-cell .jsgantt-hor-scroll").css({
                "margin-left": a + "px",
                width: $(".scrollHor-cell").width() - a + "px"
              }), o.css({width: e + (-a + r) + "px"}), t.callEvent("onPanelResize", [r, a])
            }), a.attachEvent("onPanelResizeEnd", function (i, n, r, a) {
              var o = s ? r : a, l = t.$ui.getView("grid"), c = l ? l.$parent : null;
              return c && (c.$config.minWidth = void 0), e = 0, t.config.grid_width = o
            })
          }
        }, onDestroyed: function (t) {
        }
      }
    }
  }, function (t, e, i) {
    i(1);
    var n = function (t, e) {
    };
    t.exports = {
      createLinkDND: function () {
        return {init: n}
      }
    }
  }, function (t, e, i) {
    var n = i(1), r = i(0), s = i(37);
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
                  for (var s in this._events) for (var a in t) this._events[s][a] = n[s];
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
                  var s = t.$getConfig(), a = this._drag_task_coords(i, r);
                  r.left ? (i.plannedDate = e.dateFromPos(a.start + n), i.plannedDate || (i.plannedDate = new Date(e.getState().min_date))) : (i.end_date = e.dateFromPos(a.end + n), i.end_date || (i.end_date = new Date(e.getState().max_date))), i.end_date - i.plannedDate < s.minDuration && (r.left ? i.plannedDate = e.calculateEndDate({
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
                  var r = this._drag_task_coords(e, n), s = t.$getConfig().rtl ? r.start - n.pos.x : n.pos.x - r.start,
                    a = Math.max(0, s);
                  e.progress = Math.min(1, a / Math.abs(r.end - r.start))
                },
                _find_max_shift: function (t, i) {
                  var n;
                  for (var r in t) {
                    var s = t[r], a = e.getTask(s.id), o = this._drag_task_coords(a, s),
                      l = e.posFromDate(new Date(e.getState().min_date)),
                      c = e.posFromDate(new Date(e.getState().max_date));
                    if (o.end + i > c) {
                      var h = c - o.end;
                      (h < n || void 0 === n) && (n = h)
                    } else if (o.start + i < l) {
                      var d = l - o.start;
                      (d < n || void 0 === n) && (n = d)
                    }
                  }
                  return n
                },
                _move: function (t, i, n) {
                  var r = this._drag_task_coords(t, n), s = e.dateFromPos(r.start + i), a = e.dateFromPos(r.end + i);
                  s ? a ? (t.plannedDate = s, t.end_date = a) : (t.end_date = new Date(e.getState().max_date), t.plannedDate = e.dateFromPos(e.posFromDate(t.end_date) - (r.end - r.start))) : (t.plannedDate = new Date(e.getState().min_date), t.end_date = e.dateFromPos(e.posFromDate(t.plannedDate) + (r.end - r.start)))
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
                    if (!s(this, 40)) return;
                    this._update_on_move(t)
                  }
                },
                _update_item_on_move: function (t, i, n, r, s) {
                  var a = e.getTask(i), o = e.mixin({}, a), l = e.mixin({}, a);
                  this._handlers[n].apply(this, [l, t, r]), e.mixin(a, l, !0), e.callEvent("onTaskDrag", [a.id, n, l, o, s]), e.mixin(a, l, !0), e.refreshTask(i)
                },
                _update_on_move: function (i) {
                  var s = this.drag, a = t.$getConfig();
                  if (s.mode) {
                    var o = n.getRelativeEventPosition(i, t.$task_data);
                    if (s.pos && s.pos.x == o.x) return;
                    s.pos = o;
                    var l = e.dateFromPos(o.x);
                    if (!l || isNaN(l.getTime())) return;
                    var c = o.x - s.start_x, h = e.getTask(s.id);
                    if (this._handlers[s.mode]) {
                      if (e.isSummaryTask(h) && s.mode == a.drag_mode.move) {
                        var d = {};
                        d[s.id] = r.copy(s);
                        var u = this._find_max_shift(r.mixin(d, this.dragMultiple), c);
                        for (var f in void 0 !== u && (c = u), this._update_item_on_move(c, s.id, s.mode, s, i), this.dragMultiple) {
                          var g = this.dragMultiple[f];
                          this._update_item_on_move(c, g.id, g.mode, g, i)
                        }
                      } else this._update_item_on_move(c, s.id, s.mode, s, i);
                      e._update_parents(s.id)
                    }
                  }
                },
                on_mouse_down: function (i, r) {
                  if (2 != i.button || void 0 === i.button) {
                    var s = t.$getConfig(), a = e.locate(i), o = null;
                    if (e.isTaskExists(a) && (o = e.getTask(a)), !e.isReadonly(o) && !this.drag.mode) {
                      this.clear_drag_state(), r = r || i.target;
                      var l = n.getClassName(r), c = this._get_drag_mode(l, r);
                      if (!l || !c) return r.parentNode ? this.on_mouse_down(i, r.parentNode) : void 0;
                      if (c) if (c.mode && c.mode != s.drag_mode.ignore && s["drag_" + c.mode]) {
                        if (a = e.locate(r), o = e.copy(e.getTask(a) || {}), e.isReadonly(o)) return this.clear_drag_state(), !1;
                        if (e.isSummaryTask(o) && c.mode != s.drag_mode.progress) return void this.clear_drag_state();
                        c.id = a;
                        var h = n.getRelativeEventPosition(i, e.$task_data);
                        c.start_x = h.x, c.start_y = h.y, c.obj = o, this.drag.start_drag = c, this.drag.timestamp = Date.now()
                      } else this.clear_drag_state(); else if (e.checkEvent("onMouseDown") && e.callEvent("onMouseDown", [l.split(" ")[0]]) && r.parentNode) return this.on_mouse_down(i, r.parentNode)
                    }
                  }
                },
                _fix_dnd_scale_time: function (i, n) {
                  var r = t.$getConfig(), s = e.getScale().unit, a = e.getScale().step;

                  function o(i) {
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

                  r.round_dnd_dates || (s = "minute", a = r.time_step), n.mode == r.drag_mode.resize ? n.left ? (i.plannedDate = e.roundDate({
                    date: i.plannedDate,
                    unit: s,
                    step: a
                  }), o(i)) : (i.end_date = e.roundDate({date: i.end_date, unit: s, step: a}), function (i) {
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
                    unit: s,
                    step: a
                  }), o(i), i.end_date = e.calculateEndDate(i))
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
                  var s = e.getTask(t);
                  if (i.work_time && i.correct_work_time && this._fix_working_times(s, n), this._fix_dnd_scale_time(s, n), this._fireEvent("before_finish", n.mode, [t, n.mode, e.copy(n.obj), r])) {
                    var a = t;
                    e._init_task_timing(s), this.clear_drag_state(), e.updateTask(s.id), this._fireEvent("after_finish", n.mode, [a, n.mode, r])
                  } else this.clear_drag_state(), t == n.id && (n.obj._joc_changed = !1, e.mixin(s, n.obj, !0)), e.refreshTask(s.id)
                },
                on_mouse_up: function (i) {
                  var n = this.drag;
                  if (n.mode && n.id) {
                    var r = t.$getConfig(), s = e.getTask(n.id), a = this.dragMultiple;
                    if (e.isSummaryTask(s) && n.mode == r.drag_mode.move) for (var o in a) this._finalize_mouse_up(a[o].id, r, a[o], i);
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
                      var s = i.getAttribute("data-bind-property");
                      r.left = "plannedDate" == s;
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
                  var r = t.$getConfig(), s = n.id;
                  if (r["drag_" + n.mode] && e.callEvent("onBeforeDrag", [s, n.mode, i]) && this._fireEvent("before_start", n.mode, [s, n.mode, i])) {
                    delete n.start_drag;
                    var a = e.getTask(s);
                    e.isSummaryTask(a) && n.mode == r.drag_mode.move && e.eachTask(function (t) {
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
    var n = i(0), r = i(105), s = i(104), a = i(1);
    t.exports = function (t) {
      var e = t.$services;
      return {
        onCreated: function (e) {
          var a = e.$config;
          a.bind = n.defined(a.bind) ? a.bind : "task", a.bindLinks = n.defined(a.bindLinks) ? a.bindLinks : "link", e._linksDnD = s.createLinkDND(), e._tasksDnD = r.createTaskDND(), e._tasksDnD.extend(e), this._mouseDelegates = i(15)(t)
        }, onInitialized: function (e) {
          this._attachDomEvents(t), this._attachStateProvider(t, e), e._tasksDnD.init(e, t), e._linksDnD.init(e, t), "timeline" == e.$config.id && this.extendDom(e)
        }, onDestroyed: function (e) {
          this._clearDomEvents(t), this._clearStateProvider(t), e._tasksDnD && e._tasksDnD.destructor()
        }, extendDom: function (e) {
          t.$task = e.$task, t.$task_scale = e.$task_scale, t.$task_data = e.$task_data, t.$task_bg = e.$task_bg, t.$task_links = e.$task_links, t.$task_bars = e.$task_bars
        }, _clearDomEvents: function () {
          this._mouseDelegates.destructor(), this._mouseDelegates = null
        }, _attachDomEvents: function (t) {
          this._mouseDelegates.delegate("click", "jsgantt-task-link", t.bind(function (t, e) {
            var i = this.locate(t, this.config.link_attribute);
            i && this.callEvent("onLinkClick", [i, t])
          }, t), this.$task), this._mouseDelegates.delegate("click", "jsgantt-scale-cell", t.bind(function (e, i) {
            var n = a.getRelativeEventPosition(e, t.$task_data), r = t.dateFromPos(n.x),
              s = Math.floor(t.columnIndexByDate(r)), o = t.getScale().trace_x[s];
            t.callEvent("onScaleClick", [e, o])
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
        var s = function (t, e) {
          var i = n.getNodePosition(e.$grid_data), r = n.getRelativeEventPosition(t, e.$grid_data),
            s = e.$config.rowStore, a = i.x, o = r.y - 10, l = e.$getConfig();
          o < i.y && (o = i.y);
          var c = s.countVisible() * l.row_height;
          return o > i.y + c - l.row_height && (o = i.y + c - l.row_height), i.x = a, i.y = o, i
        }(t, i);
        e.marker.style.left = s.x + 9 + "px", e.marker.style.top = s.y + "px";
        var a = e.markerLine;
        a || ((a = document.createElement("div")).className = "jsgantt-drag-marker jsgantt-grid-dnd-marker", a.innerHTML = "<div class='jsgantt-grid-dnd-marker-line'></div>", a.style.pointerEvents = "none", document.body.appendChild(a), e.markerLine = a), t.child ? function (t, e, i) {
          var n = t.targetParent, s = r({x: 0, y: i.getItemTop(n)}, i);
          e.innerHTML = "<div class='jsgantt-grid-dnd-marker-folder'></div>", e.style.width = i.$grid_data.offsetWidth + "px", e.style.top = s.y + "px", e.style.left = s.x + "px", e.style.height = i.getItemHeight(n) + "px"
        }(t, a, i) : function (t, e, i) {
          var n = function (t, e) {
            var i = e.$config.rowStore, n = {x: 0, y: 0}, s = e.$grid_data.querySelector(".jsgantt-tree-indent"),
              a = 15, o = 0;
            if (s && (a = s.offsetWidth), t.targetId !== i.$getRootId()) {
              var l = e.getItemTop(t.targetId), c = e.getItemHeight(t.targetId);
              if (o = i.exists(t.targetId) ? i.calculateItemLevel(i.getItem(t.targetId)) : 0, t.prevSibling) n.y = l; else if (t.nextSibling) {
                var h = 0;
                i.eachItem(function (t) {
                  -1 !== i.getIndexById(t.id) && h++
                }, t.targetId), n.y = l + c + h * c
              } else n.y = l + c, o += 1
            }
            return n.x = 40 + o * a, n.width = Math.max(e.$grid_data.offsetWidth - n.x, 0), r(n, e)
          }(t, i);
          e.innerHTML = "<div class='jsgantt-grid-dnd-marker-line'></div>", e.style.left = n.x + "px", e.style.height = "4px", e.style.top = n.y - 2 + "px", e.style.width = n.width + "px"
        }(t, a, i)
      }
    }
  }, function (t, e, i) {
    var n = i(13);
    t.exports = function (t, e, i, r, s) {
      var a;
      if (e !== s.$getRootId()) a = i < .25 ? n.prevSiblingTarget(t, e, s) : !(i > .6) || s.hasChild(e) && s.getItem(e).$open ? n.firstChildTarget(t, e, s) : n.nextSiblingTarget(t, e, s); else {
        var o = s.$getRootId();
        a = s.hasChild(o) && r >= 0 ? n.lastChildTarget(t, o, s) : n.firstChildTarget(t, o, s)
      }
      return a
    }
  }, function (t, e, i) {
    var n = i(13);

    function r(t, e, i, r, s) {
      for (var a = e; r.exists(a);) {
        var o = r.calculateItemLevel(r.getItem(a));
        if ((o === i || o === i - 1) && r.getBranchIndex(a) > -1) break;
        a = s ? r.getPrev(a) : r.getNext(a)
      }
      return r.exists(a) ? r.calculateItemLevel(r.getItem(a)) === i ? s ? n.nextSiblingTarget(t, a, r) : n.prevSiblingTarget(t, a, r) : n.firstChildTarget(t, a, r) : null
    }

    function s(t, e, i, n) {
      return r(t, e, i, n, !0)
    }

    function a(t, e, i, n) {
      return r(t, e, i, n, !1)
    }

    t.exports = function (t, e, i, r, o, l) {
      var c;
      if (e !== o.$getRootId()) i < .5 ? o.calculateItemLevel(o.getItem(e)) === l ? c = o.getPrevSibling(e) ? n.nextSiblingTarget(t, o.getPrevSibling(e), o) : n.prevSiblingTarget(t, e, o) : (c = s(t, e, l, o)) && (c = a(t, e, l, o)) : o.calculateItemLevel(o.getItem(e)) === l ? c = n.nextSiblingTarget(t, e, o) : (c = a(t, e, l, o)) && (c = s(t, e, l, o)); else {
        var h = o.$getRootId(), d = o.getChildren(h);
        c = n.createDropTargetObject(), c = d.length && r >= 0 ? s(t, function (t) {
          for (var e = t.getNext(); t.exists(e);) {
            var i = t.getNext(e);
            if (!t.exists(i)) return e;
            e = i
          }
          return null
        }(o), l, o) : a(t, h, l, o)
      }
      return c
    }
  }, function (t, e, i) {
    i(1), i(13), i(109), i(108), i(107);
    t.exports = {
      init: function (t, e) {
        t.$services.getService("dnd")
      }
    }
  }, function (t, e, i) {
    i(1);
    t.exports = {
      init: function (t, e) {
      }
    }
  }, function (t, e, i) {
    var n = i(0), r = i(111), s = i(110);
    t.exports = function (t) {
      return {
        onCreated: function (e) {
          e.$config = n.mixin(e.$config, {bind: "task"}), "grid" == e.$config.id && this.extendGantt(e), this._mouseDelegates = i(15)(t)
        }, onInitialized: function (e) {
          var i = e.$getConfig();
          i.order_branch && ("marker" == i.order_branch ? s.init(e.$jsgantt, e) : r.init(e.$jsgantt, e)), this.initEvents(e, t), "grid" == e.$config.id && this.extendDom(e)
        }, onDestroyed: function (e) {
          "grid" == e.$config.id && t.ext.inlineEditors.destructor(), this.clearEvents(e, t)
        }, initEvents: function (t, e) {
          this._mouseDelegates.delegate("click", "jsgantt-row", e.bind(function (i, n, r) {
            if ($(r).hasClass("fa")) {
              const t = i.clientY + 8, e = i.clientX - 20;
              $(".list-dropdown").css({
                top: t + "px",
                left: e + "px",
                bottom: "auto"
              })
            } else {
              var s = t.$getConfig();
              if (null !== n) {
                var a = this.getTask(n);
                s.scroll_on_click && !e._is_icon_open_click(i) && this.showDate(a.plannedDate), e.callEvent("onTaskRowClick", [n, r])
              }
            }
          }, e), t.$grid), this._mouseDelegates.delegate("click", "jsgantt-grid-head-cell", e.bind(function (i, n, r) {
            var s = r.getAttribute("data-column-id");
            if (e.callEvent("onPanelHeaderClick", [s, i])) {
              var a = t.$getConfig();
              if ("add" != s && a.sort) {
                for (var o, l = s, c = 0; c < a.columns.length; c++) if (a.columns[c].name == s) {
                  o = a.columns[c];
                  break
                }
                if (o && void 0 !== o.sort && !0 !== o.sort && !(l = o.sort)) return;
                var h = this._sort && this._sort.direction && this._sort.name == s ? this._sort.direction : "desc";
                h = "desc" == h ? "asc" : "desc", this._sort = {name: s, direction: h}, this.sort(l, "desc" == h)
              }
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
        var r = i.getGridColumns(), s = i.$getConfig(), a = i.$getTemplates(), o = i.$config.rowStore;
        s.rtl && (r = r.reverse());
        for (var l = [], c = 0; c < r.length; c++) {
          var h, d, u, f = c == r.length - 1, g = r[c];
          d = g.template ? g.template(e) : e[g.name], n.isDate(d) && (d = a.date_grid(d, e)), u = d, d = "<div class='jsgantt-tree-content'>" + d + "</div>";
          var _ = "jsgantt-cell" + (f ? " jsgantt-last-cell" : ""), p = [];
          if (g.tree) {
            for (var v = 0; v < e.$level; v++) p.push(a.grid_indent(e));
            o.hasChild(e.id) && !t.isSplitTask(e) ? (p.push(a.grid_open(e)), p.push(a.grid_folder(e))) : (p.push(a.grid_blank(e)), p.push(a.grid_file(e)))
          }
          var m = "width:" + (g.width - (f ? 1 : 0)) + "px;padding-right:16px";
          f && (m = "width:auto;padding-right:16px"), this.defined(g.align) && (m += "text-align:" + g.align + ";");
          var $ = t._waiAria.gridCellAttrString(g, u);
          p.push(d), s.rtl && (p = p.reverse()), h = "<div class='" + _ + "' data-column-index='" + c + "' data-column-name='" + g.name + "' style='" + m + "' " + $ + ">" + p.join("") + "</div>", l.push(h)
        }
        if (_ = t.getGlobalTaskIndex(e.id) % 2 == 0 ? "" : " odd", _ += e.$transparent ? " jsgantt-transparent" : "", _ += e.$dataprocessor_class ? " " + e.$dataprocessor_class : "", a.grid_row_class) {
          var y = a.grid_row_class.call(t, e.plannedDate, e.end_date, e);
          y && (_ += " " + y)
        }
        o.getSelectedId() == e.id && (_ += " jsgantt-selected");
        var w = document.createElement("div");
        w.className = "jsgantt-row" + _ + " jsgantt-row-" + t.getTaskType(e.type);
        var k = i.getItemHeight();
        return w.style.height = k + "px", w.style.lineHeight = k + "px", s.smart_rendering && (w.style.position = "absolute", w.style.left = "0px", w.style.top = i.getItemTop(e.id) + "px"), i.$config.item_attribute && w.setAttribute(i.$config.item_attribute, e.id), t._waiAria.taskRowAttr(e, w), w.innerHTML = l.join(""), w
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
          var i, n = e.$getConfig(), r = n.link_wrapper_width, s = t.y + (n.row_height - r) / 2;
          switch (t.direction) {
            case this.dirs.left:
              i = {top: s, height: r, lineHeight: r, left: t.x - t.size - r / 2, width: t.size + r};
              break;
            case this.dirs.right:
              i = {top: s, lineHeight: r, height: r, left: t.x - r / 2, width: t.size + r};
              break;
            case this.dirs.up:
              i = {top: s - t.size, lineHeight: t.size + r, height: t.size + r, left: t.x - r / 2, width: r};
              break;
            case this.dirs.down:
              i = {top: s, lineHeight: t.size + r, height: t.size + r, left: t.x - r / 2, width: r}
          }
          return i
        }, get_line_sizes: function (t, e) {
          var i, n = e.$getConfig(), r = n.link_line_width, s = n.link_wrapper_width, a = t.size + r;
          switch (t.direction) {
            case this.dirs.left:
            case this.dirs.right:
              i = {height: r, width: a, marginTop: (s - r) / 2, marginLeft: (s - r) / 2};
              break;
            case this.dirs.up:
            case this.dirs.down:
              i = {height: a, width: r, marginTop: (s - r) / 2, marginLeft: (s - r) / 2}
          }
          return i
        }, render_line: function (t, e, i) {
          var n = this.get_wrapper_sizes(t, i), r = document.createElement("div");
          r.style.cssText = ["top:" + n.top + "px", "left:" + n.left + "px", "height:" + n.height + "px", "width:" + n.width + "px"].join(";"), r.className = "jsgantt-line-wrapper";
          var s = this.get_line_sizes(t, i), a = document.createElement("div");
          return a.style.cssText = ["height:" + s.height + "px", "width:" + s.width + "px", "margin-top:" + s.marginTop + "px", "margin-left:" + s.marginLeft + "px"].join(";"), a.className = "jsgantt-link-line-" + t.direction, r.appendChild(a), r
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
          var s = e.dirs;
          switch (i) {
            case s.left:
              r.x -= n;
              break;
            case s.right:
              r.x += n;
              break;
            case s.up:
              r.y -= n;
              break;
            case s.down:
              r.y += n
          }
          return this.point(r)
        }, get_points: function (i, n) {
          var r = this.get_endpoint(i, n), s = t.config, a = r.e_y - r.y, o = r.e_x - r.x, l = e.dirs;
          this.clear(), this.point({x: r.x, y: r.y});
          var c = 2 * s.link_arrow_size, h = this.get_line_type(i, n.$getConfig()), d = r.e_x > r.x;
          if (h.from_start && h.to_start) this.point_to(l.left, c), d ? (this.point_to(l.down, a), this.point_to(l.right, o)) : (this.point_to(l.right, o), this.point_to(l.down, a)), this.point_to(l.right, c); else if (!h.from_start && h.to_start) if (d = r.e_x > r.x + 2 * c, this.point_to(l.right, c), d) o -= c, this.point_to(l.down, a), this.point_to(l.right, o); else {
            o -= 2 * c;
            var u = a > 0 ? 1 : -1;
            this.point_to(l.down, u * (s.row_height / 2)), this.point_to(l.right, o), this.point_to(l.down, u * (Math.abs(a) - s.row_height / 2)), this.point_to(l.right, c)
          } else h.from_start || h.to_start ? h.from_start && !h.to_start && (d = r.e_x > r.x - 2 * c, this.point_to(l.left, c), d ? (o += 2 * c, u = a > 0 ? 1 : -1, this.point_to(l.down, u * (s.row_height / 2)), this.point_to(l.right, o), this.point_to(l.down, u * (Math.abs(a) - s.row_height / 2)), this.point_to(l.left, c)) : (o += c, this.point_to(l.down, a), this.point_to(l.right, o))) : (this.point_to(l.right, c), d ? (this.point_to(l.right, o), this.point_to(l.down, a)) : (this.point_to(l.down, a), this.point_to(l.right, o)), this.point_to(l.left, c));
          return this.path
        }, get_line_type: function (e, i) {
          var n = i.links, r = !1, s = !1;
          return e.type == n.start_to_start ? r = s = !0 : e.type == n.finish_to_finish ? r = s = !1 : e.type == n.finish_to_start ? (r = !1, s = !0) : e.type == n.start_to_finish ? (r = !0, s = !1) : t.assert(!1, "Invalid link type"), i.rtl && (r = !r, s = !s), {
            from_start: r,
            to_start: s
          }
        }, get_endpoint: function (e, i) {
          var r = i.$getConfig(), s = this.get_line_type(e, r), a = s.from_start, o = s.to_start,
            l = t.getTask(e.source), c = t.getTask(e.target), h = n(l, i), d = n(c, i);
          return {x: a ? h.left : h.left + h.width, e_x: o ? d.left : d.left + d.width, y: h.top, e_y: d.top}
        }
      };

      function n(e, i) {
        var n = i.$getConfig(), r = i.getItemPosition(e);
        if (t.getTaskType(e.type) == n.types.milestone) {
          var s = t.getTaskHeight(), a = Math.sqrt(2 * s * s);
          r.left -= a / 2, r.width = a
        }
        return r
      }

      return function (n, r) {
        var s = r.$getConfig(), a = i.get_endpoint(n, r), o = a.e_y - a.y;
        if (!(a.e_x - a.x || o)) return null;
        var l = i.get_points(n, r), c = e.get_lines(l, r), h = document.createElement("div"), d = "jsgantt-task-link";
        n.color && (d += " jsgantt-link-inline-color");
        var u = t.templates.link_class ? t.templates.link_class(n) : "";
        u && (d += " " + u), s.highlight_critical_path && t.isCriticalLink && t.isCriticalLink(n) && (d += " jsgantt-critical-link"), h.className = d, r.$config.link_attribute && h.setAttribute(r.$config.link_attribute, n.id);
        for (var f = 0; f < c.length; f++) {
          f == c.length - 1 && (c[f].size -= s.link_arrow_size);
          var g = e.render_line(c[f], c[f + 1], r);
          n.color && (g.firstChild.style.backgroundColor = n.color), h.appendChild(g)
        }
        var _ = c[c.length - 1].direction, p = function (t, i, n) {
          var r = n.$getConfig(), s = document.createElement("div"), a = t.y, o = t.x, l = r.link_arrow_size,
            c = r.row_height, h = "jsgantt-link-arrow jsgantt-link-arrow-" + i;
          switch (i) {
            case e.dirs.right:
              a -= (l - c) / 2, o -= l;
              break;
            case e.dirs.left:
              a -= (l - c) / 2;
              break;
            case e.dirs.up:
              o -= l;
              break;
            case e.dirs.down:
              a += 2 * l, o -= l
          }
          return s.style.cssText = ["top:" + a + "px", "left:" + o + "px"].join(";"), s.className = h, s
        }(l[l.length - 1], _, r);
        return n.color && (p.style.borderColor = n.color), h.appendChild(p), h
      }
    }
  }, function (t, e) {
    t.exports = function (t) {
      return function (e, i) {
        var n = i.$getConfig(), r = i.$getTemplates(), s = i.getScale(), a = s.count, o = document.createElement("div");
        if (n.show_task_cells) for (var l = 0; l < a; l++) {
          var c = s.width[l], h = "";
          if (c > 0) {
            var d = document.createElement("div");
            d.style.width = c + "px", h = "jsgantt-task-cell" + (l == a - 1 ? " jsgantt-last-cell" : ""), (f = r.task_cell_class(e, s.trace_x[l])) && (h += " " + f), d.className = h, o.appendChild(d)
          }
        }
        var u = t.getGlobalTaskIndex(e.id) % 2 != 0, f = r.task_row_class(e.plannedDate, e.end_date, e),
          g = "jsgantt-task-row" + (u ? " odd" : "") + (f ? " " + f : "");
        return i.$config.rowStore.getSelectedId() == e.id && (g += " jsgantt-selected"), o.className = g, n.smart_rendering && (o.style.position = "absolute", o.style.top = i.getItemTop(e.id) + "px", o.style.width = "100%"), o.style.height = n.row_height + "px", i.$config.item_attribute && o.setAttribute(i.$config.item_attribute, e.id), o
      }
    }
  }, function (t, e, i) {
    t.exports = function (t) {
      var e = i(30)(t);
      return function (i, n) {
        if (t.isSplitTask(i)) {
          for (var r = document.createElement("div"), s = t.getTaskPosition(i), a = t.getChildren(i.id), o = 0; o < a.length; o++) {
            var l = t.getTask(a[o]), c = e(l, n);
            if (c) {
              var h = Math.floor((t.config.row_height - s.height) / 2);
              c.style.top = s.top + h + "px", c.className += " jsgantt-split-child", r.appendChild(c)
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

      return i(2)(r, e), n.mixin(r.prototype, {}, !0), r
    }
  }, function (t, e, i) {
    t.exports = function (t) {
      var e = i(7)(t), n = i(0);

      function r() {
        return e.apply(this, arguments) || this
      }

      return i(2)(r, e), n.mixin(r.prototype, !0), r
    }
  }, function (t, e, i) {
    t.exports = function (t) {
      var e = i(7)(t);

      function n() {
        return e.apply(this, arguments) || this
      }

      return i(0), i(2)(n, e), n
    }
  }, function (t, e, i) {
    t.exports = function (t) {
      var e = i(7)(t);

      function n() {
        return e.apply(this, arguments) || this
      }

      return i(0), i(2)(n, e), n
    }
  }, function (t, e, i) {
    t.exports = function (t) {
      var e = i(7)(t);

      function n() {
        return e.apply(this, arguments) || this
      }

      return i(0), i(2)(n, e), n
    }
  }, function (t, e) {
    t.exports = {}
  }, function (t, e) {
    t.exports = {}
  }, function (t, e, i) {
    t.exports = function (t) {
    }
  }, function (t, e, i) {
    var n = i(124), r = i(0), s = (i(1), i(4));
    t.exports = function (t) {
      var e = n(t), i = {};
      s(i);
      var a = {};
      return r.mixin(a, e), r.mixin(a, i), a
    }
  }, function (t, e, i) {
    var n = i(0), r = i(31), s = i(14), a = i(2), o = function (t) {
      function e(e, i, n, r) {
        var s = t.apply(this, arguments) || this;
        return s.$config.bindLinks = null, s
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
      }, !0), n.mixin(e.prototype, s(t), !0), e
    }(r);
    t.exports = o
  }, function (t, e, i) {
    var n = i(1), r = i(0), s = i(14), a = i(16), o = i(2), l = function (t) {
      function e(e, i, n, r) {
        return t.apply(this, arguments) || this
      }

      return o(e, t), r.mixin(e.prototype, {
        init: function () {
          void 0 === this.$config.bind && (this.$config.bind = this.$getConfig().resource_store), t.prototype.init.apply(this, arguments)
        }, _initEvents: function () {
          var e = this.$jsgantt;
          t.prototype._initEvents.apply(this, arguments), this._mouseDelegates.delegate("click", "jsgantt-row", e.bind(function (t, e, i) {
            var r = this.$config.rowStore;
            if (!r) return !0;
            var s = n.locateAttribute(t, this.$config.item_attribute);
            return s && r.select(s.getAttribute(this.$config.item_attribute)), !1
          }, this), this.$grid)
        }
      }, !0), r.mixin(e.prototype, s(e), !0), e
    }(a);
    t.exports = l
  }, function (t, e, i) {
    var n = i(1);
    t.exports = function (t, e) {
      var i = {
        column_before_start: t.bind(function (t, i, r) {
          var s = e.$getConfig();
          if (!n.locateAttribute(r, s.grid_resizer_column_attribute)) return !1;
          var a = this.locate(r, s.grid_resizer_column_attribute), o = e.getGridColumns()[a];
          return !1 !== e.callEvent("onColumnResizeStart", [a, o]) && void 0
        }, t), column_after_start: t.bind(function (t, i, n) {
          var r = e.$getConfig(), s = this.locate(n, r.grid_resizer_column_attribute);
          t.config.marker.innerHTML = "", t.config.marker.className += " jsgantt-grid-resize-area", t.config.marker.style.height = e.$grid.offsetHeight + "px", t.config.marker.style.top = "0px", t.config.drag_index = s
        }, t), column_drag_move: t.bind(function (i, r, s) {
          var a = e.$getConfig(), o = i.config, l = e.getGridColumns(), c = parseInt(o.drag_index, 10), h = l[c],
            d = n.getNodePosition(e.$grid_scale), u = parseInt(o.marker.style.left, 10),
            f = h.min_width ? h.min_width : a.min_grid_column_width, g = e.$grid_data.offsetWidth, _ = 0, p = 0;
          a.rtl ? u = d.x + d.width - 1 - u : u -= d.x - 1;
          for (var v = 0; v < c; v++) f += l[v].width, _ += l[v].width;
          if (u < f && (u = f), a.keep_grid_width) {
            var m = 0;
            for (v = c + 1; v < l.length; v++) l[v].min_width ? g -= l[v].min_width : a.min_grid_column_width && (g -= a.min_grid_column_width), l[v].max_width && !1 !== m ? m += l[v].max_width : m = !1;
            m && (f = e.$grid_data.offsetWidth - m), u < f && (u = f), u > g && (u = g)
          } else if (!e.$config.scrollable) {
            var $ = u, y = 0;
            for (v = c + 1; v < l.length; v++) y += l[v].width;
            $ + y > t.$container.offsetWidth && (u = t.$container.offsetWidth - y)
          }
          return o.left = u - 1, p = Math.abs(u - _), h.max_width && p > h.max_width && (p = h.max_width), a.rtl && (_ = d.width - _ + 2 - p), o.marker.style.top = d.y + "px", o.marker.style.left = d.x - 1 + _ + "px", o.marker.style.width = p + "px", e.callEvent("onColumnResize", [c, l[c], p - 1]), !0
        }, t), column_drag_end: t.bind(function (i, n, r) {
          for (var s = e.$getConfig(), a = e.getGridColumns(), o = 0, l = parseInt(i.config.drag_index, 10), c = a[l], h = 0; h < l; h++) o += a[h].width;
          var d = c.min_width && i.config.left - o < c.min_width ? c.min_width : i.config.left - o;
          if (c.max_width && c.max_width < d && (d = c.max_width), !1 !== e.callEvent("onColumnResizeEnd", [l, c, d]) && c.width != d) {
            if (c.width = d, s.keep_grid_width) o = s.grid_width; else {
              h = l;
              for (var u = a.length; h < u; h++) o += a[h].width
            }
            e.callEvent("onColumnResizeComplete", [a, e._setColumnsWidth(o, l)]), e.$config.scrollable || t.$layout._syncCellSizes(e.$config.group, s.grid_width), this.render()
          }
        }, t)
      };
      return {
        init: function () {
          var n = t.$services.getService("dnd"), r = e.$getConfig(), s = new n(e.$grid_scale, {updates_per_second: 60});
          t.defined(r.dnd_sensitivity) && (s.config.sensitivity = r.dnd_sensitivity), s.attachEvent("onBeforeDragStart", function (t, e) {
            return i.column_before_start(s, t, e)
          }), s.attachEvent("onAfterDragStart", function (t, e) {
            return i.column_after_start(s, t, e)
          }), s.attachEvent("onDragMove", function (t, e) {
            return i.column_drag_move(s, t, e)
          }), s.attachEvent("onDragEnd", function (t, e) {
            return i.column_drag_end(s, t, e)
          })
        }, doOnRender: function () {
          for (var i = e.getGridColumns(), n = e.$getConfig(), r = 0, s = e.$config.width, a = n.scale_height, o = 0; o < i.length; o++) {
            var l, c = i[o];
            if (r += c.width, l = n.rtl ? s - r : r, c.resize) {
              var h = document.createElement("div");
              h.className = "jsgantt-grid-column-resize-wrap", h.style.top = "0px", h.style.height = a + "px", h.innerHTML = "<div class='jsgantt-grid-column-resize'></div>", h.setAttribute(n.grid_resizer_column_attribute, o), t._waiAria.gridSeparatorAttr(h), e.$grid_scale.appendChild(h), h.style.left = Math.max(0, l) + "px"
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

          function s(t) {
            return i[t] || null
          }

          function a(t, e, i) {
            return (t + "" + e + i.bottomBorderColor + i.rightBorderColor).replace(/[^\w\d]/g, "")
          }

          function o(t, e) {
            i[t] = e
          }

          function l(t, e, i) {
            var n = Math.floor(500 / t) || 1, s = Math.floor(500 / e) || 1, a = document.createElement("canvas");
            a.height = e * s, a.width = t * n;
            var o = a.getContext("2d");
            return function (t, e, i, n, s, a) {
              var o = s.createImageData(e * n, t * i);
              o.imageSmoothingEnabled = !1;
              for (var c = 1 * a.rightBorderWidth, h = r(a.rightBorderColor), d = 0, u = 0, f = 0, g = 1; g <= n; g++) for (d = g * e - 1, f = 0; f < c; f++) for (u = 0; u < t * i; u++) l(d - f, u, h, o);
              var _ = 1 * a.bottomBorderWidth, p = r(a.bottomBorderColor);
              u = 0;
              for (var v = 1; v <= i; v++) for (u = v * t - 1, f = 0; f < _; f++) for (d = 0; d < e * n; d++) l(d, u - f, p, o);
              s.putImageData(o, 0, 0)
            }(e, t, s, n, o, i), a.toDataURL();

            function l(e, i, r, s) {
              var a = 4 * (i * (t * n) + e);
              s.data[a] = r.r, s.data[a + 1] = r.g, s.data[a + 2] = r.b, s.data[a + 3] = r.a
            }
          }

          function c(t) {
            return "jsgantt-static-bg-" + t
          }

          return {
            render: function (t, i, r, h) {
              if (i.static_background && document.createElement("canvas").getContext) {
                t.innerHTML = "";
                var d = function (t, i, n, r) {
                  var s, a, o = [], l = 0, c = n.width.filter(function (t) {
                    return !!t
                  }), h = 0, d = 1e5;
                  if (e.isIE) {
                    var u = navigator.appVersion || "";
                    -1 == u.indexOf("Windows NT 6.2") && -1 == u.indexOf("Windows NT 6.1") && -1 == u.indexOf("Windows NT 6.0") || (d = 2e4)
                  }
                  for (var f = 0; f < c.length; f++) {
                    var g = c[f];
                    if (g != a && void 0 !== a || f == c.length - 1 || l > d) {
                      for (var _ = r, p = 0, v = Math.floor(d / i.row_height) * i.row_height, m = l; _ > 0;) {
                        var $ = Math.min(_, v);
                        _ -= v, (s = document.createElement("div")).style.height = $ + "px", s.style.position = "absolute", s.style.top = p + "px", s.style.left = h + "px", s.style.whiteSpace = "no-wrap", s.className = t[a || g], f == c.length - 1 && (m = g + m - 1), s.style.width = m + "px", o.push(s), p += $
                      }
                      l = 0, h += m
                    }
                    g && (l += g, a = g)
                  }
                  return o
                }(function (t, e, i) {
                  var r = {}, h = function (t) {
                    for (var e = t.width, i = {}, n = 0; n < e.length; n++) 1 * e[n] && (i[e[n]] = !0);
                    return i
                  }(i), d = e.row_height, u = "";
                  for (var f in h) {
                    var g = 1 * f, _ = a(g, d, t);
                    if (!s(_)) {
                      var p = l(g, d, t);
                      o(_, p), u += "." + c(_) + "{ background-image: url('" + p + "');}"
                    }
                    r[f] = c(_)
                  }
                  return u && ((function () {
                    var t = document.getElementById(n);
                    return t || ((t = document.createElement("style")).id = n, document.body.appendChild(t)), t
                  }()).innerHTML += u), r
                }(function (t) {
                  var e = document.createElement("div");
                  e.className = "jsgantt-task-cell";
                  var i = document.createElement("div");
                  i.className = "jsgantt-task-row", i.appendChild(e), t.appendChild(i);
                  var n = getComputedStyle(i), r = getComputedStyle(e), s = {
                    bottomBorderWidth: n.getPropertyValue("border-bottom-width").replace("px", ""),
                    rightBorderWidth: r.getPropertyValue("border-right-width").replace("px", ""),
                    bottomBorderColor: n.getPropertyValue("border-bottom-color"),
                    rightBorderColor: r.getPropertyValue("border-right-color")
                  };
                  return t.removeChild(i), s
                }(t), i, r), i, r, h), u = document.createDocumentFragment();
                d.forEach(function (t) {
                  u.appendChild(t)
                }), t.appendChild(u)
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
          var s = n - i + 1;
          if (!(i > r.length - 1 || s <= 0 || n > r.length - 1)) {
            var a = t - this.getSum(r, i, n);
            this.adjustSize(a, r, i, n), this.adjustSize(-a, r, n + 1), e.full_width = this.getSum(r)
          }
        }, splitSize: function (t, e) {
          for (var i = [], n = 0; n < e; n++) i[n] = 0;
          return this.adjustSize(t, i), i
        }, adjustSize: function (t, e, i, n) {
          i || (i = 0), void 0 === n && (n = e.length - 1);
          for (var r = n - i + 1, s = this.getSum(e, i, n), a = i; a <= n; a++) {
            var o = Math.floor(t * (s ? e[a] / s : 1 / r));
            s -= e[a], t -= o, r--, e[a] += o
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
        }, prepareConfigs: function (t, e, i, n, r, s, a) {
          for (var o = this.splitSize(n, t.length), l = i, c = [], h = t.length - 1; h >= 0; h--) {
            var d = h == t.length - 1, u = this.initScaleConfig(t[h], r, s);
            d && this.processIgnores(u), this.initColSizes(u, e, l, o[h]), this.limitVisibleRange(u), d && (l = u.full_width), c.unshift(u)
          }
          for (h = 0; h < c.length - 1; h++) this.alineScaleColumns(c[c.length - 1], c[h]);
          for (h = 0; h < c.length; h++) a && this.reverseScale(c[h]), this.setPosSettings(c[h]);
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
            for (var r = !0, s = t, a = 0; a < n.step; a++) a && (s = e.add(t, a, n.unit)), r = r && !this.isWorkTime(s, n.unit);
            return r
          }
          return !1
        }, processIgnores: function (t) {
          t.ignore_x = {}, t.display_count = t.count
        }, initColSizes: function (t, i, n, r) {
          var s = n;
          t.height = r;
          var a = void 0 === t.display_count ? t.count : t.display_count;
          a || (a = 1), t.col_width = Math.floor(s / a), i && t.col_width < i && (t.col_width = i, s = t.col_width * a), t.width = [];
          for (var o = t.ignore_x || {}, l = 0; l < t.trace_x.length; l++) if (o[t.trace_x[l].valueOf()] || t.display_count == t.count) t.width[l] = 0; else {
            var c = 1;
            "month" == t.unit && (c = Math.round((e.add(t.trace_x[l], t.step, t.unit) - t.trace_x[l]) / 864e5)), t.width[l] = c
          }
          this.adjustSize(s - this.getSum(t.width), t.width), t.full_width = this.getSum(t.width)
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
          for (var s = e.trace_x, a = t.trace_x, o = i || 0, l = n || a.length - 1, c = 0, h = 1; h < s.length; h++) {
            var d = t.trace_indexes[+s[h]];
            void 0 !== d && d <= l && (r && r.apply(this, [c, h, o, d]), o = d, c = h)
          }
        }, alineScaleColumns: function (t, e, i, n) {
          this.iterateScales(t, e, i, n, function (i, n, r, s) {
            var a = this.getSum(t.width, r, s - 1);
            this.getSum(e.width, i, n - 1) != a && this.setSumWidth(a, e, i, n - 1)
          })
        }, eachColumn: function (i, n, r, s, a) {
          var o = new Date(r), l = new Date(s);
          e[i + "_start"] && (o = e[i + "_start"](o));
          var c = new Date(o);
          for (+c >= +l && (l = e.add(c, n, i)); +c < +l;) {
            a.call(this, new Date(c));
            var h = c.getTimezoneOffset();
            c = e.add(c, n, i), c = t._correct_dst_change(c, h, n, i), e[i + "_start"] && (c = e[i + "_start"](c))
          }
        }, limitVisibleRange: function (t) {
          var i = t.trace_x, n = t.width.length - 1, r = 0;
          if (+i[0] < +t.min_date && 0 != n) {
            var s = Math.floor(t.width[0] * ((i[1] - t.min_date) / (i[1] - i[0])));
            r += t.width[0] - s, t.width[0] = s, i[0] = new Date(t.min_date)
          }
          var a = i.length - 1, o = i[a], l = e.add(o, t.step, t.unit);
          if (+l > +t.max_date && a > 0 && (s = t.width[a] - Math.floor(t.width[a] * ((l - t.max_date) / (l - o))), r += t.width[a] - s, t.width[a] = s), r) {
            for (var c = this.getSum(t.width), h = 0, d = 0; d < t.width.length; d++) {
              var u = Math.floor(r * (t.width[d] / c));
              t.width[d] += u, h += u
            }
            this.adjustSize(r - h, t.width)
          }
        }
      }
    }
  }, function (t, e, i) {
    var n = i(2), r = i(1), s = i(0), a = i(8), o = function (t) {
      "use strict";

      function e(e, i, n, r) {
        var a = t.apply(this, arguments) || this;
        this.$config = s.mixin(i, {scroll: "x"}), a._scrollHorizontalHandler = s.bind(a._scrollHorizontalHandler, a), a._scrollVerticalHandler = s.bind(a._scrollVerticalHandler, a), a._outerScrollVerticalHandler = s.bind(a._outerScrollVerticalHandler, a), a._outerScrollHorizontalHandler = s.bind(a._outerScrollHorizontalHandler, a), a._mouseWheelHandler = s.bind(a._mouseWheelHandler, a), this.$config.hidden = !0;
        var o = r.config.scroll_size;
        return r.env.isIE && (o += 1), this._isHorizontal() ? (a.$config.height = o, a.$parent.$config.height = o) : (a.$config.width = o, a.$parent.$config.width = o), this.$config.scrollPosition = 0, a.$name = "scroller", a
      }

      return n(e, t), e.prototype.init = function (t) {
        t.innerHTML = this.$toHTML(), this.$view = t.firstChild, this.$view || this.init(), this._isVertical() ? this._initVertical() : this._initHorizontal(), this._initMouseWheel(), this._initLinkedViews()
      }, e.prototype.$toHTML = function () {
        return "<div class='jsgantt-layout-cell " + (this._isHorizontal() ? "jsgantt-hor-scroll" : "jsgantt-ver-scroll") + "'><div style='" + (this._isHorizontal() ? "width:2020px" : "height:2020px") + "'></div></div>"
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
        for (var t = this._getLinkedViews(), e = this._isVertical() ? "jsgantt-right-panel jsgantt-layout-outer-scroll jsgantt-layout-outer-scroll-vertical" : "jsgantt-layout-outer-scroll jsgantt-layout-outer-scroll-horizontal", i = 0; i < t.length; i++) r.addClassName(t[i].$view || t[i].getNode(), e)
      }, e.prototype._initVertical = function () {
        this.$scroll_ver = this.$view, this.$domEvents.attach(this.$view, "scroll", this._scrollVerticalHandler)
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
        for (var t, e = 0, i = 0, n = this._isHorizontal(), r = this._getLinkedViews(), s = n ? "scrollWidth" : "scrollHeight", a = n ? "contentX" : "contentY", o = n ? "x" : "y", l = this._getScrollOffset(), c = 0; c < r.length; c++) if ((t = r[c]) && t.$content && t.$content.getSize && !t.$config.hidden) {
          var h, d = t.$content.getSize();
          if (h = d.hasOwnProperty(s) ? d[s] : d[a], l) d[a] > d[o] && d[a] > e && h > d[o] - l + 2 && (e = h + (n ? 0 : 2), i = d[o]); else {
            var u = Math.max(d[a] - h, 0);
            (h += u) > Math.max(d[o] - u, 0) && h > e && (e = h, i = d[o])
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
          var r = i[n].$parent.$cells, s = r[r.length - 1];
          if (s && "scrollbar" == s.$config.view && !1 === s.$config.hidden) {
            t = s.$config.width;
            break
          }
        }
        return t || 0
      }, e.prototype._setScrollSize = function (t) {
        var e = this._isHorizontal() ? "width" : "height",
          i = this._isHorizontal() ? this.$scroll_hor : this.$scroll_ver, n = this._getScrollOffset(), s = i.firstChild;
        n ? this._isVertical() ? (this.$config.outerSize = this.$config.height - n + 3, i.style.height = this.$config.outerSize + "px", i.style.top = n - 1 + "px", r.addClassName(i, this.$parent._borders.top), r.addClassName(i.parentNode, "jsgantt-task-vscroll")) : (this.$config.outerSize = this.$config.width - n + 1, i.style.width = this.$config.outerSize + "px") : (i.style.top = "auto", r.removeClassName(i, this.$parent._borders.top), r.removeClassName(i.parentNode, "jsgantt-task-vscroll"), this.$config.outerSize = this.$config.height), s.style[e] = t + "px"
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
          var i = {}, n = a.isFF, r = n ? -20 * t.deltaX : 2 * t.wheelDeltaX, s = n ? -40 * t.deltaY : t.wheelDelta;
          if (!t.shiftKey || t.deltaX || t.wheelDeltaX || (r = 2 * s, s = 0), r && Math.abs(r) > Math.abs(s)) {
            if (this._isVertical()) return;
            if (i.x) return !0;
            if (!this.$scroll_hor || !this.$scroll_hor.offsetWidth) return !0;
            var o = r / -40, l = this._oldLeft, c = l + 30 * o;
            if (this.scrollHorizontally(c), this.$scroll_hor.scrollLeft = c, l == this.$scroll_hor.scrollLeft) return !0;
            this._oldLeft = this.$scroll_hor.scrollLeft
          } else {
            if (this._isHorizontal()) return;
            if (i.y) return !0;
            if (!this.$scroll_ver || !this.$scroll_ver.offsetHeight) return !0;
            o = s / -40, void 0 === s && (o = t.detail);
            var h = this._oldTop, d = this.$scroll_ver.scrollTop + 30 * o;
            if (this.scrollVertically(d), this.$scroll_ver.scrollTop = d, h == this.$scroll_ver.scrollTop) return !0;
            this._oldTop = this.$scroll_ver.scrollTop
          }
          return t.preventDefault && t.preventDefault(), t.cancelBubble = !0, !1
        }
      }, e
    }(i(6));
    t.exports = o
  }, function (t, e, i) {
    var n = i(2), r = i(1), s = i(0), a = i(6), o = function (t) {
      "use strict";

      function e(e, i, n) {
        var r, s, a = t.apply(this, arguments) || this;
        return a._moveHandler = function (t) {
          a._moveResizer(a._resizer, t.pageX, t.pageY)
        }, a._upHandler = function () {
          var t = a._getNewSizes();
          !1 !== a.callEvent("onPanelResizeEnd", [r, s, t ? t.back : 0, t ? t.front : 0]) && a._setSizes(), a._setBackground(!1), a._clearResizer(), a._clearListeneres()
        }, a._clearListeneres = function () {
          this.$domEvents.detach(document, "mouseup", a._upHandler), this.$domEvents.detach(document, "mousemove", a._moveHandler), this.$domEvents.detach(document, "mousemove", a._startOnMove), this.$domEvents.detach(document, "mouseup", a._cancelDND)
        }, a._callStartDNDEvent = function () {
          if (this._xMode ? (r = this._behind.$config.width || this._behind.$view.offsetWidth, s = this._front.$config.width || this._front.$view.offsetWidth) : (r = this._behind.$config.height || this._behind.$view.offsetHeight, s = this._front.$config.height || this._front.$view.offsetHeight), !1 === a.callEvent("onPanelResizeStart", [r, s])) return !1
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
        return t.className = "resizer-stick", this.$view.appendChild(t), this.$view.style.overflow = "visible", t.style.height = this.$view.style.height, t
      }, e.prototype._getDirection = function (t, e) {
        var i;
        return (i = this._xMode ? t - this._positions.x : e - this._positions.y) ? i < 0 ? -1 : 1 : 0
      }, e.prototype._getResizePosition = function (t, e) {
        var i, n, r, s, a;
        this._xMode ? (i = t - this._positions.x, n = this._behind.$config.width || this._behind.$view.offsetWidth, s = this._front.$config.width || this._front.$view.offsetWidth, r = this._behind.$config.minWidth, a = this._front.$config.minWidth) : (i = e - this._positions.y, n = this._behind.$config.height || this._behind.$view.offsetHeight, s = this._front.$config.height || this._front.$view.offsetHeight, r = this._front.$config.minHeight, a = this._front.$config.minHeight);
        var o, l, c = this._getDirection(t, e);
        if (-1 === c) {
          if (l = s - i, o = n - Math.abs(i), s - i > this._front.$config.maxWidth) return;
          Math.abs(i) >= n && (i = -Math.abs(n - 2)), n - Math.abs(i) <= r && (i = -Math.abs(n - r))
        } else l = s - Math.abs(i), o = n + i, n + i > this._behind.$config.maxWidth && (i = this._behind.$config.maxWidth - n), Math.abs(i) >= s && (i = s - 2), s - Math.abs(i) <= a && (i = Math.abs(s - a));
        return -1 === c ? (l = s - i, o = n - Math.abs(i)) : (l = s - Math.abs(i), o = n + i), {
          size: i,
          newFrontSide: l,
          newBehindSide: o
        }
      }, e.prototype._getGroupName = function () {
        return this._getSiblings(), this._front.$config.group || this._behind.$config.group
      }, e.prototype._eachGroupItem = function (t, e) {
        for (var i = this.$factory.getView("main"), n = this._getGroupName(), r = i.getCellsByType("resizer"), s = 0; s < r.length; s++) r[s]._getGroupName() == n && r[s] != this && t.call(e || this, r[s])
      }, e.prototype._getGroupResizePosition = function (t, e) {
        var i = this._getResizePosition(t, e);
        if (!this._getGroupName()) return i;
        var n, r = [i];
        this._eachGroupItem(function (i) {
          i._getSiblings();
          var n = s.copy(this._positions);
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
          n && 1 !== Math.abs(n.size) && (this._xMode ? (t.style.left = n.size + "px", this._positions.nextX = n.size || 0) : (t.style.top = n.size + "px", this._positions.nextY = n.size || 0), this.callEvent("onPanelResize", [n.newBehindSide, n.newFrontSide]))
        }
      }, e.prototype._setGravity = function (t) {
        var e = this._xMode ? "offsetWidth" : "offsetHeight",
          i = this._xMode ? this._positions.nextX : this._positions.nextY, n = this._front.$view[e],
          r = this._behind.$view[e], s = (n - i) / n * this._front.getSize().gravity,
          a = (r + i) / r * this._behind.getSize().gravity;
        "front" !== t && (this._front.$config.gravity = s), "behind" !== t && (this._behind.$config.gravity = a)
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
    t.exports = o
  }, function (t, e, i) {
    var n = i(2), r = i(0), s = function (t) {
      "use strict";

      function e(e, i, n) {
        var s = t.apply(this, arguments) || this;
        if (i.view) {
          i.id && (this.$id = r.uid());
          var a = r.copy(i);
          if (delete a.config, delete a.templates, this.$content = this.$factory.createView(i.view, this, a, this), !this.$content) return !1
        }
        return s.$name = "viewCell", s
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
    t.exports = s
  }, function (t, e, i) {
    var n = i(2), r = i(35), s = i(6), a = function (t) {
      "use strict";

      function e(e, i, n) {
        for (var r = t.apply(this, arguments) || this, s = 0; s < r.$cells.length; s++) r.$cells[s].$config.hidden = 0 !== s;
        return r.$cell = r.$cells[0], r.$name = "viewLayout", r
      }

      return n(e, t), e.prototype.cell = function (e) {
        var i = t.prototype.cell.call(this, e);
        return i.$view || this.$fill(null, this), i
      }, e.prototype.moveView = function (t) {
        var e = this.$view;
        this.$cell && (this.$cell.$config.hidden = !0, e.removeChild(this.$cell.$view)), this.$cell = t, e.appendChild(t.$view)
      }, e.prototype.setSize = function (t, e) {
        s.prototype.setSize.call(this, t, e)
      }, e.prototype.setContentSize = function () {
        var t = this.$lastSize;
        this.$cell.setSize(t.contentX, t.contentY)
      }, e.prototype.getSize = function () {
        var e = t.prototype.getSize.call(this);
        if (this.$cell) {
          for (var i = this.$cell.getSize(), n = 0; n < this.$cells.length; n++) {
            var r = this.$cells[n].getSize();
            for (var s in i) i[s] = Math.max(i[s], r[s])
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

      function r(r, s, a) {
        if (n[r]) return n[r];
        s.renderer || t.assert(!1, "Invalid renderer call");
        var o = s.filter;
        return a && a.setAttribute(e.config().layer_attribute, !0), n[r] = {
          render_item: function (e, i) {
            if (i = i || a, !o || o(e)) {
              var n = function (t) {
                return s.renderer.call(this, t, s.host)
              }.call(t, e);
              this.append(e, n, i)
            } else this.remove_item(e.id)
          }, clear: function (t) {
            this.rendered = i[r] = {}, s.append || this.clear_container(t)
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
    var n = i(135), r = i(0), s = i(1);

    function a(t) {
      return t instanceof Array || (t = Array.prototype.slice.call(arguments, 0)), function (e) {
        for (var i = !0, n = 0, r = t.length; n < r; n++) {
          var s = t[n];
          s && (i = i && !1 !== s(e.id, e))
        }
        return i
      }
    }

    t.exports = function (t) {
      var e = n(t);
      return {
        createGroup: function (i, n, o) {
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
              for (var i = this.container(), a = this.tempCollection, o = 0; o < a.length; o++) if (t = a[o], this.container() || t && t.container && s.isChildOf(t.container, document.body)) {
                var l = t.container, c = t.id, h = t.topmost;
                if (!l.parentNode) if (h) i.appendChild(l); else {
                  var d = n ? n() : i.firstChild;
                  d ? i.insertBefore(l, d) : i.appendChild(l)
                }
                this.renderers[c] = e.getRenderer(c, t, l), this.tempCollection.splice(o, 1), o--
              }
            }, addLayer: function (t) {
              return t && ("function" == typeof t && (t = {renderer: t}), void 0 === t.filter ? t.filter = a(o || []) : t.filter instanceof Array && (t.filter.push(o), t.filter = a(t.filter)), t.container || (t.container = document.createElement("div"))), this._add(t), t ? t.id : void 0
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
          var n = i.name, r = i.defaultContainer, s = i.defaultContainerSibling,
            a = e.createGroup(r, s, function (t, e) {
              if (!a.filters) return !0;
              for (var i = 0; i < a.filters.length; i++) if (!1 === a.filters[i](t, e)) return !1
            });
          return t.$services.setService("layer:" + n, function () {
            return a
          }), t.attachEvent("onJSGanttReady", function () {
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
            _clearTaskLayers: function () {
              e.clear()
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
        var i = {click: {}};

        function n(t, e, n, r) {
          i[t][e] || (i[t][e] = []), i[t][e].push({handler: n, root: r})
        }

        function r(t) {
          t = t || window.event;
          var n = e.locate(t), r = a(t, i.click), s = !0;
          if (null !== n ? s = !e.checkEvent("onTaskClick") || e.callEvent("onTaskClick", [n, t]) : e.callEvent("onEmptyClick", [t]), s) {
            if (!function (t, i, n) {
              for (var r = !0, s = 0; s < t.length; s++) {
                var a = t[s].call(e, i, n, i.target);
                r = r && !(void 0 !== a && !0 !== a)
              }
              return r
            }(r, t, n)) return;
            n && e.getTask(n)
          }
        }

        function s(t) {
        }

        function a(e, i) {
          for (var n = e.target, r = []; n;) {
            var s = t.getClassName(n);
            if (s) {
              s = s.split(" ");
              for (var a = 0; a < s.length; a++) if (s[a] && i[s[a]]) for (var o = i[s[a]], l = 0; l < o.length; l++) o[l].root && !t.isChildOf(n, o[l].root) || r.push(o[l].handler)
            }
            n = n.parentNode
          }
          return r
        }

        function o(t) {
        }

        function l(t) {
          if (e.checkEvent("onMouseMove")) {
            var i = e.locate(t);
            e._last_move_event = t, e.callEvent("onMouseMove", [i, t])
          }
        }

        var c = e._createDomEventScope();

        function h(t) {
          c.detachAll(), t && (c.attach(t, "click", r), c.attach(t, "dblclick", o), c.attach(t, "mousemove", l), c.attach(t, "contextmenu", s))
        }

        return {
          reset: h, global: function (t, e, i) {
            n(t, e, i, null)
          }, delegate: n, detach: function (t, e, n, r) {
            if (i[t] && i[t][e]) {
              for (var s = i[t], a = s[e], o = 0; o < a.length; o++) a[o].root == r && (a.splice(o, 1), o--);
              a.length || delete s[e]
            }
          }, callHandler: function (t, e, n, r) {
            var s = i[t][e];
            if (s) for (var a = 0; a < s.length; a++) (n || s[a].root) && s[a].root !== n || s[a].handler.apply(this, r)
          }, onMouseMove: l, onClick: r, destructor: function () {
            h(), i = null, c = null
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

    function s(t, e) {
      var i = this.$config[t];
      return i ? i instanceof r ? i : (r.prototype = e, this.$config[t] = new r(i), this.$config[t]) : e
    }

    t.exports = function (t, e) {
      n.mixin(t, function (t) {
        var e, i;
        return {
          $getConfig: function () {
            return e || (e = t ? t.$getConfig() : this.$jsgantt.config), s.call(this, "config", e)
          }, $getTemplates: function () {
            return i || (i = t ? t.$getTemplates() : this.$jsgantt.templates), s.call(this, "templates", i)
          }
        }
      }(e))
    }
  }, function (t, e, i) {
    var n = i(0), r = i(139);
    t.exports = {
      createFactory: function (t) {
        var e = {}, i = {};

        function s(s, a, o, l) {
          var c = e[s];
          if (!c || !c.create) return !1;
          "resizer" != s || o.mode || (l.$config.cols ? o.mode = "x" : o.mode = "y"), "viewcell" != s || "scrollbar" != o.view || o.scroll || (l.$config.cols ? o.scroll = "y" : o.scroll = "x"), (o = n.copy(o)).id || i[o.view] || (o.id = o.view), o.id && !o.css && (o.css = o.id + "-cell");
          var h = new c.create(a, o, this, t);
          return c.configure && c.configure(h), r(h, l), h.$id || (h.$id = o.id || t.uid()), h.$parent || "object" != typeof a || (h.$parent = a), h.$config || (h.$config = o), i[h.$id] && (h.$id = t.uid()), i[h.$id] = h, h
        }

        return {
          initUI: function (t, e) {
            var i = "cell";
            return t.view ? i = "viewcell" : t.resizer ? i = "resizer" : t.rows || t.cols ? i = "layout" : t.views && (i = "multiview"), s.call(this, i, null, t, e)
          }, reset: function () {
            i = {}
          }, registerView: function (t, i, n) {
            e[t] = {create: i, configure: n}
          }, createView: s, getView: function (t) {
            return i[t]
          }
        }
      }
    }
  }, function (t, e, i) {
    var n = i(140), r = i(138), s = i(137), a = i(6), o = i(35), l = i(134), c = i(133), h = i(132), d = i(131),
      u = i(34), f = i(16), g = i(127), _ = i(31), p = i(126), v = i(125), m = i(30), $ = i(116), y = i(115),
      w = i(114), k = i(113), b = i(112), x = i(106), S = i(103);
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
        i.registerView("cell", a), i.registerView("resizer", h), i.registerView("scrollbar", d), i.registerView("layout", o, function (t) {
          "main" === (t.$config ? t.$config.id : null) && e(t, S)
        }), i.registerView("viewcell", c), i.registerView("multiview", l), i.registerView("timeline", u, function (t) {
          "timeline" !== (t.$config ? t.$config.id : null) && "task" != t.$config.bind || e(t, x)
        }), i.registerView("grid", f, function (t) {
          "grid" !== (t.$config ? t.$config.id : null) && "task" != t.$config.bind || e(t, b)
        }), i.registerView("resourceGrid", g), i.registerView("resourceTimeline", _), i.registerView("resourceHistogram", p);
        var D = s(t), C = v(t);
        return t.ext.inlineEditors = C, t.ext._inlineEditors = C, {
          factory: i,
          mouseEvents: r.init(t),
          layersApi: D.init(),
          render: {gridLine: k(t), taskBg: y(t), taskBar: m(t), taskSplitBar: $(t), link: w(t)},
          layersService: {
            getDataRender: function (e) {
              return D.getDataRender(e, t)
            }, createDataRender: function (e) {
              return D.createDataRender(e, t)
            }
          }
        }
      }
    }
  }, function (t, e, i) {
    i(0), i(1), t.exports = function (t) {
    }
  }, function (t, e, i) {
    (function (t, e) {
      !function (t, i) {
        "use strict";
        if (!t.setImmediate) {
          var n, r = 1, s = {}, a = !1, o = t.document, l = Object.getPrototypeOf && Object.getPrototypeOf(t);
          l = l && l.setTimeout ? l : t, "[object process]" === {}.toString.call(t.process) ? n = function (t) {
            e.nextTick(function () {
              h(t)
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
              i.source === t && "string" == typeof i.data && 0 === i.data.indexOf(e) && h(+i.data.slice(e.length))
            };
            t.addEventListener ? t.addEventListener("message", i, !1) : t.attachEvent("onmessage", i), n = function (i) {
              t.postMessage(e + i, "*")
            }
          }() : t.MessageChannel ? function () {
            var t = new MessageChannel;
            t.port1.onmessage = function (t) {
              h(t.data)
            }, n = function (e) {
              t.port2.postMessage(e)
            }
          }() : o && "onreadystatechange" in o.createElement("script") ? function () {
            var t = o.documentElement;
            n = function (e) {
              var i = o.createElement("script");
              i.onreadystatechange = function () {
                h(e), i.onreadystatechange = null, t.removeChild(i), i = null
              }, t.appendChild(i)
            }
          }() : n = function (t) {
            setTimeout(h, 0, t)
          }, l.setImmediate = function (t) {
            "function" != typeof t && (t = new Function("" + t));
            for (var e = new Array(arguments.length - 1), i = 0; i < e.length; i++) e[i] = arguments[i + 1];
            var a = {callback: t, args: e};
            return s[r] = a, n(r), r++
          }, l.clearImmediate = c
        }

        function c(t) {
          delete s[t]
        }

        function h(t) {
          if (a) setTimeout(h, 0, t); else {
            var e = s[t];
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

      function s(t, e) {
        this._id = t, this._clearFn = e
      }

      e.setTimeout = function () {
        return new s(r.call(setTimeout, n, arguments), clearTimeout)
      }, e.setInterval = function () {
        return new s(r.call(setInterval, n, arguments), clearInterval)
      }, e.clearTimeout = e.clearInterval = function (t) {
        t && t.close()
      }, s.prototype.unref = s.prototype.ref = function () {
      }, s.prototype.close = function () {
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
        var s = t.config, a = t.templates;
        t.config[i] && e[r] != s[i] && (n && a[r] || (a[r] = t.date.date_to_str(s[i]), e[r] = s[i]))
      }

      return {
        initTemplates: function () {
          var e = t.date, n = e.date_to_str, r = t.config;
          i("dateScale", !0, void 0, t.config, t.templates), i("date_grid", !0, "grid_date_format", t.config, t.templates), i("task-date", !0, void 0, t.config, t.templates), t.mixin(t.templates, {
            dateFormat: e.str_to_date(r.dateFormat, r.utcFormat),
            xml_format: n(r.dateFormat, r.utcFormat),
            grid_header_class: function (t, e) {
              return ""
            },
            task_text: function (t, e, i) {
              return i.col1
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
            link_class: function (t) {
              return ""
            },
            link_description: function (e) {
              var i = t.getTask(e.source), n = t.getTask(e.target);
              return "<b>" + i.col1 + "</b> &ndash;  <b>" + n.col1 + "</b>"
            },
            drag_link: function (e, i, n, r) {
              e = t.getTask(e);
              var s = t.locale.labels, a = "<b>" + e.col1 + "</b> " + (i ? s.link_start : s.link_end) + "<br/>";
              return n && (a += "<b> " + (n = t.getTask(n)).col1 + "</b> " + (r ? s.link_start : s.link_end) + "<br/>"), a
            },
            tooltip_date_format: e.date_to_str("%Y-%m-%d")
          })
        }, initTemplate: i
      }
    }
  }, function (t, e, i) {
    var n = i(4), r = i(0), s = i(37);
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

      function i(i, s) {
        this._obj = i, this._settings = s || {}, n(this);
        var a = this.getInputMethods();
        this._drag_start_timer = null, t.attachEvent("onJSGanttScroll", r.bind(function (t, e) {
          this.clearDragTimer()
        }, this));
        for (var o = 0; o < a.length; o++) r.bind(function (n) {
          t.event(i, n.down, r.bind(function (s) {
            n.accessor(s) && (this._settings.original_target = e(s), t.config.touch ? (this.clearDragTimer(), this._drag_start_timer = setTimeout(r.bind(function () {
              this.dragStart(i, s, n)
            }, this), t.config.touch_drag)) : this.dragStart(i, s, n))
          }, this)), t.event(document.body, n.up, r.bind(function (t) {
            n.accessor(t) && this.clearDragTimer()
          }, this))
        }, this)(a[o])
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
            if (!this.config.started || !r.defined(this.config.updates_per_second) || s(this, this.config.updates_per_second)) {
              var e = n(t);
              return e && (t && t.preventDefault && t.preventDefault(), t.cancelBubble = !0), e
            }
          }, this), o = r.bind(function (n) {
            return t.eventRemove(document.body, i.move, a), t.eventRemove(document.body, i.up, o), this.dragEnd(e)
          }, this);
          t.event(document.body, i.move, a), t.event(document.body, i.up, o)
        }, checkPositionChange: function (t) {
          var e = t.x - this.config.pos.x, i = t.y - this.config.pos.y;
          return Math.sqrt(Math.pow(Math.abs(e), 2) + Math.pow(Math.abs(i), 2)) > this.config.sensitivity
        }, initDnDMarker: function () {
          var t = this.config.marker = document.createElement("div");
          t.className = "jsgantt-drag-marker", t.innerHTML = "Dragging object", document.body.appendChild(t)
        }, backupEventTarget: function (i, n) {
          if (t.config.touch) {
            var r = n(i), s = r.target, a = s.cloneNode(!0);
            this.config.original_target = e(r), this.config.original_target.target = a, this.config.backup_element = s, s.parentNode.appendChild(a), s.style.display = "none", document.body.appendChild(s)
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
            var s = this.getPosition(r);
            if (t.config.touch || this.checkPositionChange(s)) {
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
          for (var e = t.locale, i = e.date.shortMonth, n = e.date.shortMonthHash = {}, r = 0; r < i.length; r++) n[i[r]] = r;
          for (i = e.date.fullMonth, n = e.date.fullMonthHash = {}, r = 0; r < i.length; r++) n[i[r]] = r
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
        }, dayStart: function (t) {
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
                return '"+locale.date.shortDay[date.getDay()]+"';
              case"%l":
                return '"+locale.date.fullDay[date.getDay()]+"';
              case"%M":
                return '"+locale.date.shortMonth[date.getMonth()]+"';
              case"%F":
                return '"+locale.date.fullMonth[date.getMonth()]+"';
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
          for (var n = "var temp=date.match(/[a-zA-Z]+|[0-9]+/g);", r = e.match(/%[a-zA-Z]/g), s = 0; s < r.length; s++) switch (r[s]) {
            case"%j":
            case"%d":
              n += "set[2]=temp[" + s + "]||1;";
              break;
            case"%n":
            case"%m":
              n += "set[1]=(temp[" + s + "]||1)-1;";
              break;
            case"%y":
              n += "set[0]=temp[" + s + "]*1+(temp[" + s + "]>50?1900:2000);";
              break;
            case"%g":
            case"%G":
            case"%h":
            case"%H":
              n += "set[3]=temp[" + s + "]||0;";
              break;
            case"%i":
              n += "set[4]=temp[" + s + "]||0;";
              break;
            case"%Y":
              n += "set[0]=temp[" + s + "]||0;";
              break;
            case"%a":
            case"%A":
              n += "set[3]=set[3]%12+((temp[" + s + "]||'').toLowerCase()=='am'?0:12);";
              break;
            case"%s":
              n += "set[5]=temp[" + s + "]||0;";
              break;
            case"%M":
              n += "set[1]=locale.date.shortMonth_hash[temp[" + s + "]]||0;";
              break;
            case"%F":
              n += "set[1]=locale.date.fullMonthHash[temp[" + s + "]]||0;"
          }
          var a = "set[0],set[1],set[2],set[3],set[4],set[5]";
          i && (a = " Date.UTC(" + a + ")");
          var o = new Function("date", "locale", "var set=[0,0,1,0,0,0]; " + n + " return new Date(" + a + ");");
          return function (e) {
            return o(e, t.locale)
          }
        }, getISOWeek: function (e) {
          return t.date._getWeekNumber(e, !0)
        }, _getWeekNumber: function (t, e) {
          if (!t) return !1;
          var i = t.getDay();
          e && 0 === i && (i = 7);
          var n = new Date(t.valueOf());
          n.setDate(t.getDate() + (4 - i));
          var r = n.getFullYear(), s = Math.round((n.getTime() - new Date(r, 0, 1).getTime()) / 864e5);
          return 1 + Math.floor(s / 7)
        }, getWeek: function (e) {
          return t.date._getWeekNumber(e, t.config.startFromMonday)
        }, parseDate: function (e, i) {
          return e && !e.getFullYear && ("function" != typeof i && (i = "string" == typeof i ? t.defined(t.templates[i]) ? t.templates[i] : t.date.str_to_date(i) : t.templates.dateFormat), e = e ? i(e) : null), e
        }
      };
      return e
    }
  }, function (t, e, i) {
    e.default = function (t) {
      if ("string" == typeof t || "number" == typeof t) return t;
      var e = "";
      for (var i in t) {
        var n = "";
        t.hasOwnProperty(i) && (n = i + "=" + (n = "string" == typeof t[i] ? encodeURIComponent(t[i]) : "number" == typeof t[i] ? t[i] : encodeURIComponent(JSON.stringify(t[i]))), e.length && (n = "&" + n), e += n)
      }
      return e
    }
  }, , function (t, e) {
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
        drag_move: !1,
        drag_mode: {resize: "resize", progress: "progress", move: "move", ignore: "ignore"},
        round_dnd_dates: !0,
        link_wrapper_width: 20,
        root_id: 0,
        autofit: !1,
        columns: [{name: "col1", label: "Column 1", width: "*", align: "left"}, {
          name: "col2",
          tree: !0,
          label: "Column 2",
          align: "left"
        }],
        orders: 'Orders',
        orderId: 'Order ID',
        repeatEvery: 'Repeat Every',
        cyclicOrder: 'Cyclic Order',
        begin: 'Begin',
        end: 'End',
        step: 1,
        scrollable: !0,
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
        sort: !1,
        details_on_create: !0,
        details_on_dblclick: !0,
        initial_scroll: !0,
        task_scroll_offset: 100,
        order_branch: !1,
        order_branch_free: !1,
        min_column_width: 44,
        min_grid_column_width: 44,
        grid_resizer_column_attribute: "column_index",
        grid_resizer_attribute: "grid-resizer",
        keep_grid_width: !1,
        grid_resize: !0,
        readonly_property: "readonly",
        editable_property: "editable",
        type_renderers: {},
        open_tree_initially: !1,
        optimize_render: !0,
        prevent_default_scroll: !1,
        show_errors: !0,
        wai_aria_attributes: !0,
        smart_scales: !0,
        rtl: !1
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
  }, , function (t, e, i) {
    i(19), t.exports = function () {
      var t = new function () {
        this.templates = {}, this.ext = {}, this.keys = {}
      };
      i(155)(t), t.$services = t.$inject(i(154)), t.config = t.$inject(i(153)), t.date = i(150)(t);
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
      var s = i(0);
      s.mixin(t, s), t.Promise = i(146), t.env = i(8);
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
      var o = i(20)();
      t.event = o.attach, t.eventRemove = o.detach, t._eventRemoveAll = o.detachAll, t._createDomEventScope = o.extend, s.mixin(t, i(142)(t));
      var l = i(141).init(t);
      t.$ui = l.factory, t.$ui.layers = l.render, t.$mouseEvents = l.mouseEvents, t.$services.setService("mouseEvents", function () {
        return t.$mouseEvents
      }), t.mixin(t, l.layersApi), i(102)(t), t.$services.setService("layers", function () {
        return l.layersService
      });
      var c = i(101);
      t.mixin(t, c()), i(100)(t);
      var h = i(94);
      return t.createDataProcessor = h.createDataProcessor, i(90)(t), i(81)(t), i(80)(t), i(78)(t), i(77)(t), i(76)(t), i(75)(t), i(66)(t), i(65)(t), i(55)(t), i(54)(t), i(52)(t), i(51)(t), i(50)(t), i(49)(t), i(48)(t), i(47)(t), i(46)(t), i(45)(t), i(44)(t), i(43)(t), i(42)(t), i(41)(t), i(39)(t), t
    }
  }, function (t, e, i) {
    var n = {
      _seed: 0, getJSGanttObj: function () {
        let t = i(157)();
        return t._internal_id = n._seed++, n.$syncFactory && n.$syncFactory(t), i(38)(t), t
      }
    };
    window.jsgantt = n.getJSGanttObj()
  }])
};
