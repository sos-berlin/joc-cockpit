var JSGantt = function () {
  return function (t) {
    var e = {};

    function i(n) {
      if (e[n]) return e[n].exports;
      let r = e[n] = {i: n, l: !1, exports: {}};
      return t[n].call(r.exports, r, r.exports, i), r.l = !0, r.exports
    }

    return i(i.s = 159)
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
        var a = t.getBoundingClientRect(), s = document.body,
          o = document.documentElement || document.body.parentNode || document.body,
          l = window.pageYOffset || o.scrollTop || s.scrollTop, c = window.pageXOffset || o.scrollLeft || s.scrollLeft,
          d = o.clientTop || s.clientTop || 0, h = o.clientLeft || s.clientLeft || 0;
        e = a.top + l - d, i = a.left + c - h, n = document.body.offsetWidth - a.right, r = document.body.offsetHeight - a.bottom
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
      return e.baseVal && (e = e.baseVal), e.indexOf || (e = ""), s(e)
    }

    var r = document.createElement("div");

    function a(t) {
      return t.tagName ? t : (t = t || window.event).target
    }

    function s(t) {
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
        for (var i = t.childNodes, n = i.length, r = [], a = 0; a < n; a++) {
          var s = i[a];
          s.className && -1 !== s.className.indexOf(e) && r.push(s)
        }
        return r
      }, toNode: function (t) {
        return "string" == typeof t ? document.getElementById(t) || document.querySelector(t) || document.body : t || document.body
      }, locateClassName: function (t, e, i) {
        var r = a(t), o = "";
        for (void 0 === i && (i = !0); r;) {
          if (o = n(r)) {
            var l = o.indexOf(e);
            if (l >= 0) {
              if (!i) return r;
              var c = 0 === l || !s(o.charAt(l - 1)), d = l + e.length >= o.length || !s(o.charAt(l + e.length));
              if (c && d) return r
            }
          }
          r = r.parentNode
        }
        return null
      }, locateAttribute: function (t, e) {
        if (e) {
          for (var i = a(t); i;) {
            if (i.getAttribute && i.getAttribute(e)) return i;
            i = i.parentNode
          }
          return null
        }
      }, getTargetNode: a, getRelativeEventPosition: function (t, e) {
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
    var n = i(0), r = i(4), a = i(1), s = function () {
      "use strict";

      function t(t, e, i, s) {
        t && (this.$container = a.toNode(t), this.$parent = t), this.$config = n.mixin(e, {headerHeight: 33}), this.$jsgantt = s, this.$domEvents = s._createDomEventScope(), this.$id = e.id || "c" + n.uid(), this.$name = "cell", this.$factory = i, r(this)
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
          a.locateAttribute(e, "data-cell-id") == t.$id && t.toggle()
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
        this.$view.style.height = e + "px";
        if($(this.$view).hasClass('jsgantt-layout-cell jsgantt-hor-scroll')) {
          let self = this;
          setTimeout(function () {
            let l = $('.jsgantt-resizer-x').position().left;
            self.$view.style.width = (t - l) + "px";
            self.$view.style.marginLeft = l + "px";
          }, 0)
        } else {
          this.$view.style.width = t + "px";
        }
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
        for (var n in this._borders) a.removeClassName(i, this._borders[n]);
        "string" == typeof t && (t = [t]);
        var r = {};
        for (n = 0; n < t.length; n++) a.addClassName(i, t[n]), r[t[n]] = !0;
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
    t.exports = s
  }, function (t, e) {
    t.exports = function (t) {
      return function () {
      }
    }
  }, function (t, e) {
    var i = {
      isIE: navigator.userAgent.indexOf("MSIE") >= 0 || navigator.userAgent.indexOf("Trident") >= 0,
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
    i(3);
    t.exports = {}
  }, function (t, e, i) {
    var n = i(2);
    i(11);
    t.exports = function (t) {
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
            var i = this, a = n.delay(function () {
              i.$jsgantt.getState().lightbox ? a() : i.$config.rowStore.refresh()
            }, 300);
            this._delayRender = a;
            var s = "_attached_" + e.$config.name;
            i[s] || (i[s] = t.attachEvent("onStoreUpdated", a)), this.$jsgantt.attachEvent("onDestroy", function () {
              return r(i), !0
            }), e.$attachedResourceViewHandler || (e.$attachedResourceViewHandler = e.attachEvent("onBeforeStoreUpdate", function () {
              if (i.$jsgantt.getState().lightbox) return !1;
              a.$pending && a.$cancelTimeout(), i._updateNestedTasks()
            }))
          }
        }, _updateNestedTasks: function () {
          var t = this.$jsgantt, e = t.getDatastore(t.config.resource_store);
          if (e.$config.fetchTasks) {
            var i = t.config.resource_property;
            e.silent(function () {
              var n = [], r = {}, a = {};
              for (var s in e.eachItem(function (s) {
                "task" != s.$role ? t.getTaskBy(i, s.id).forEach(function (i) {
                  var a = t.copy(i);
                  a.id = i.id + "_" + s.id, a.$task_id = i.id, a.$resource_id = s.id, a[e.$parentProperty] = s.id, a.$role = "task", n.push(a), r[a.id] = !0
                }) : a[s.id] = !0
              }), a) r[s] || e.removeItem(s);
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
        delegate: function (i, n, r, a) {
          e.push([i, n, r, a]), t.$services.getService("mouseEvents").delegate(i, n, r, a)
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
    var n = i(1), r = i(0), a = i(4), s = i(128), o = i(32), l = function (t, e, i, n) {
      this.$config = r.mixin({}, e || {}), this.$jsgantt = n, this.$parent = t, a(this), this.$state = {}
    };
    l.prototype = {
      init: function (t) {
        var e = this.$jsgantt, n = e._waiAria.gridAttrString(), r = e._waiAria.gridDataAttrString();
        t.innerHTML = "<div class='jsgantt-grid' style='height:inherit;width:inherit;' " + n + "></div>", this.$grid = t.childNodes[0], this.$grid.innerHTML = "<div class='jsgantt-grid-scale' " + e._waiAria.gridScaleRowAttrString() + "></div><div class='jsgantt-grid-data' " + r + "></div>", this.$grid_scale = this.$grid.childNodes[0], this.$grid_data = this.$grid.childNodes[1];
        var a = this.$getConfig()[this.$config.bind + "_attribute"];
        if (!a && this.$config.bind && (a = this.$config.bind + "_id"), this.$config.item_attribute = a || null, !this.$config.layers) {
          var o = this._createLayerConfig();
          this.$config.layers = o
        }
        var l = s(e, this);
        l.init(), this._renderHeaderResizers = l.doOnRender, this._mouseDelegates = i(15)(e), this._addLayers(this.$jsgantt), this._initEvents(), this.callEvent("onReady", [])
      }, _validateColumnWidth: function (t, e) {
        var i = t[e];
        if (i && "*" != i) {
          var n = this.$jsgantt, r = 1 * i;
          isNaN(r) ? n.assert(!1, "Wrong " + e + " value of column " + t.name) : t[e] = r
        }
      }, setSize: function (t, e) {
        this.$config.width = this.$state.width = t, this.$state.height = e;
        for (var i, n = this.getGridColumns(), r = 0, a = 0, s = n.length; a < s; a++) this._validateColumnWidth(n[a], "min_width"), this._validateColumnWidth(n[a], "max_width"), this._validateColumnWidth(n[a], "width"), r += 1 * n[a].width;
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
          for (var r = this.$config.layers, a = 0; r && a < r.length; a++) {
            var s = r[a];
            s.host = this;
            var o = n.addLayer(s);
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
            var a = this.$rowsPlaceholder = document.createElement("div");
            a.style.visibility = "hidden", a.style.height = n + "px", a.style.width = "1px", this.$grid_data.appendChild(a)
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
          var a = n.locateAttribute(t, this.$config.item_attribute);
          return a && r.close(a.getAttribute(this.$config.item_attribute)), !1
        }, this), this.$grid), this._mouseDelegates.delegate("click", "jsgantt-open", t.bind(function (t, e, i) {
          var r = this.$config.rowStore;
          if (!r) return !0;
          var a = n.locateAttribute(t, this.$config.item_attribute);
          return a && r.open(a.getAttribute(this.$config.item_attribute)), !1
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
        var i = this.$getConfig(), n = this.getGridColumns(), r = 0, a = t;
        e = window.isNaN(e) ? -1 : e;
        for (var s = 0, o = n.length; s < o; s++) r += 1 * n[s].width;
        if (window.isNaN(r)) for (this._calculateGridWidth(), r = 0, s = 0, o = n.length; s < o; s++) r += 1 * n[s].width;
        var l = a - r, c = 0;
        for (s = 0; s < e + 1; s++) c += n[s].width;
        for (r -= c, s = e + 1; s < n.length; s++) {
          var d = n[s], h = Math.round(l * (d.width / r));
          l < 0 ? d.min_width && d.width + h < d.min_width ? h = d.min_width - d.width : !d.min_width && i.min_grid_column_width && d.width + h < i.min_grid_column_width && (h = i.min_grid_column_width - d.width) : d.max_width && d.width + h > d.max_width && (h = d.max_width - d.width), r -= d.width, d.width += h, l -= h
        }
        for (var u = l > 0 ? 1 : -1; l > 0 && 1 === u || l < 0 && -1 === u;) {
          var f = l;
          for (s = e + 1; s < n.length; s++) {
            var g;
            if ((g = n[s].width + u) == this._getColumnWidth(n[s], i, g) && (l -= u, n[s].width = g), !l) break
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
        for (var t = this.$getConfig(), e = this.getGridColumns(), i = 0, n = [], r = [], a = 0; a < e.length; a++) {
          var s = parseFloat(e[a].width);
          window.isNaN(s) && (s = t.min_grid_column_width || 10, n.push(a)), r[a] = s, i += s
        }
        var o = this._getGridWidth() + 1;
        if (t.autofit || n.length) {
          var l = o - i;
          if (t.autofit) for (a = 0; a < r.length; a++) {
            var c = Math.round(l / (r.length - a));
            r[a] += c, (d = this._getColumnWidth(e[a], t, r[a])) != r[a] && (c = d - r[a], r[a] = d), l -= c
          } else if (n.length) for (a = 0; a < n.length; a++) {
            c = Math.round(l / (n.length - a));
            var d, h = n[a];
            r[h] += c, (d = this._getColumnWidth(e[h], t, r[h])) != r[h] && (c = d - r[h], r[h] = d), l -= c
          }
          for (a = 0; a < r.length; a++) e[a].width = r[a]
        } else {
          var u = o != i;
          this.$config.width = i - 1, t.grid_width = i, u && this.$parent._setContentSize(this.$config.width, this.$config.height)
        }
      }, _renderGridHeader: function () {
        var t = this.$jsgantt, e = this.$getConfig(), i = this.$jsgantt.locale, n = this.$jsgantt.templates,
          r = this.getGridColumns();
        e.rtl && (r = r.reverse());
        for (var a = [], s = 0, o = i.labels, l = e.scale_height - 1, c = 0; c < r.length; c++) {
          var d = c == r.length - 1, h = r[c];
          h.name || (h.name = t.uid() + "");
          var u = 1 * h.width, f = this._getGridWidth();
          d && f > s + u && (h.width = u = f - s), s += u;
          var g = t._sort && h.name == t._sort.name ? "<div class='jsgantt-sort jsgantt-" + t._sort.direction + "'></div>" : "",
            _ = ["jsgantt-grid-head-cell", "jsgantt-grid-head-" + h.name, d ? "jsgantt-last-cell" : "", n.grid_header_class(h.name, h)].join(" "),
            p = "width:" + (u - (d ? 1 : 0)) + "px;padding-right:16px",
            v = h.label || o["column_" + h.name] || o[h.name];
          d && (p = "width:auto;padding-right:16px"), v = v || "";
          var m = "<div class='" + _ + "' style='" + p + "' " + t._waiAria.gridScaleCellAttrString(h, v) + " data-column-id='" + h.name + "' column_id='" + h.name + "'>" + v + g + "</div>";
          a.push(m)
        }
        this.$grid_scale.style.height = e.scale_height + "px", this.$grid_scale.style.lineHeight = l + "px", this.$grid_scale.innerHTML = a.join(""), this._renderHeaderResizers && this._renderHeaderResizers()
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
      var r = [], a = {
        attach: function (t, i, n, a) {
          r.push({element: t, event: i, callback: n, capture: a}), e(t, i, n, a)
        }, detach: function (t, e, n, a) {
          i(t, e, n, a);
          for (var s = 0; s < r.length; s++) {
            var o = r[s];
            o.element === t && o.event === e && o.callback === n && o.capture === a && (r.splice(s, 1), s--)
          }
        }, detachAll: function () {
          for (var t = r.slice(), e = 0; e < t.length; e++) {
            var i = t[e];
            a.detach(i.element, i.event, i.callback, i.capture), a.detach(i.element, i.event, i.callback, void 0), a.detach(i.element, i.event, i.callback, !1), a.detach(i.element, i.event, i.callback, !0)
          }
          r.splice(0, r.length)
        }, extend: function () {
          return t(this.event, this.eventRemove)
        }
      };
      return window.scopes || (window.scopes = []), window.scopes.push(r), a
    }
  }, , , , function (t, e, i) {
    var n = i(0), r = i(3);

    function a(t, e, i, n, r) {
      return this.date = t, this.unit = e, this.task = i, this.id = n, this.calendar = r, this
    }

    function s(t, e, i, n, r, a) {
      return this.date = t, this.dir = e, this.unit = i, this.task = n, this.id = r, this.calendar = a, this
    }

    function o(t, e, i, n, r, a, s) {
      return this.plannedDate = t, this.duration = e, this.unit = i, this.step = n, this.task = r, this.id = a, this.calendar = s, this
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
          return i instanceof a ? i : ((e = i.date ? new a(i.date, i.unit, i.task, null, i.calendar) : new a(arguments[0], arguments[1], arguments[2], null, arguments[3])).unit = e.unit || t.config.durationUnit, e)
        }, getClosestWorkTimeArguments: function (e) {
          var i, n = arguments[0];
          return n instanceof s ? n : (i = r.isDate(n) ? new s(n) : new s(n.date, n.dir, n.unit, n.task, null, n.calendar), n.id && (i.task = n), i.dir = n.dir || "any", i.unit = n.unit || t.config.durationUnit, i)
        }, _getStartEndConfig: function (e) {
          var i, n = l;
          return e instanceof n ? e : (r.isDate(e) ? i = new n(arguments[0], arguments[1], arguments[2], arguments[3]) : (i = new n(e.plannedDate, e.end_date, e.task), e.id && (i.task = e)), i.unit = i.unit || t.config.durationUnit, i.step = i.step || t.config.durationStep, i.plannedDate = i.plannedDate || i.start || i.date, i)
        }, getDurationArguments: function (t, e, i, n) {
          return this._getStartEndConfig.apply(this, arguments)
        }, hasDurationArguments: function (t, e, i, n) {
          return this._getStartEndConfig.apply(this, arguments)
        }, calculateEndDateArguments: function (e, i, n, a) {
          var s, l = arguments[0];
          return l instanceof o ? l : (s = r.isDate(l) ? new o(arguments[0], arguments[1], arguments[2], void 0, arguments[3], void 0, arguments[4]) : new o(l.plannedDate, l.duration, l.unit, l.step, l.task, null, l.calendar), l.id && (s.task = l), s.unit = s.unit || t.config.durationUnit, s.step = s.step || t.config.durationStep, s)
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
            var r = new n(t), a = [r.primaryScale()].concat(t.config.subscales);
            r.sortScales(a), e = a[a.length - 1].unit, i = a[a.length - 1].step || 1
          }
          return {unit: e, step: i}
        }(t), i = e.unit, r = e.step, a = function (t, e) {
          var i = {plannedDate: null, end_date: null};
          if (e.config.plannedDate && e.config.end_date) {
            i.plannedDate = e.date[t + "_start"](new Date(e.config.plannedDate));
            var n = new Date(e.config.end_date), r = e.date[t + "_start"](new Date(n));
            n = +n != +r ? e.date.add(r, 1, t) : r, i.end_date = n
          }
          return i
        }(i, t);
        a.plannedDate && a.end_date || ((a = function (t) {
          return t.getSubtaskDates()
        }(t)).plannedDate && a.end_date || (a = {
          plannedDate: new Date,
          end_date: new Date
        }), a.plannedDate = t.date[i + "_start"](a.plannedDate), a.plannedDate = t.calculateEndDate({
          plannedDate: t.date[i + "_start"](a.plannedDate),
          duration: -1,
          unit: i,
          step: r
        }), a.end_date = t.date[i + "_start"](a.end_date), a.end_date = t.calculateEndDate({
          plannedDate: a.end_date,
          duration: 2,
          unit: i,
          step: r
        })), t._min_date = a.plannedDate, t._max_date = a.end_date
      })(t), function (t) {
        if (t.config.fit_tasks) {
          var e = +t._min_date, i = +t._max_date;
          +t._min_date == e && +t._max_date == i || (t.render(), t.callEvent("onScaleAdjusted", []))
        }
      }(t)
    }
  }, function (t, e, i) {
    var n = i(28), r = i(0), a = i(29), s = function (t) {
      return a.apply(this, [t]), this._branches = {}, this.pull = {}, this.$initItem = t.initItem, this.$parentProperty = t.parentProperty || "parent", "function" != typeof t.rootId ? this.$getRootId = function (t) {
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
    s.prototype = r.mixin({
      _buildTree: function (t) {
        for (var e = null, i = this.$getRootId(), n = 0, a = t.length; n < a; n++) e = t[n], this.setParent(e, this.getParent(e) || i);
        for (n = 0, a = t.length; n < a; n++) e = t[n], this._add_branch(e), e.$level = this.calculateItemLevel(e), r.defined(e.$open) || (e.$open = r.defined(e.open) ? e.open : this.$openInitially());
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
        1 * n !== n && (n = void 0), a.prototype._addItemInner.call(this, t, n), this.setParent(t, i), t.hasOwnProperty("$rendered_parent") && this._move_branch(t, t.$rendered_parent), this._add_branch(t, e)
      }, _changeIdInner: function (t, e) {
        var i = this.getChildren(t), n = this._searchVisibleOrder[t];
        a.prototype._changeIdInner.call(this, t, e);
        var r = this.getParent(e);
        this._replace_branch_child(r, t, e);
        for (var s = 0; s < i.length; s++) this.setParent(this.getItem(i[s]), e);
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
        }), t && a.prototype._updateOrder.call(this, t)
      }, _removeItemInner: function (t) {
        var e = [];
        this.eachItem(function (t) {
          e.push(t)
        }, t), e.push(this.getItem(t));
        for (var i = 0; i < e.length; i++) this._move_branch(e[i], this.getParent(e[i]), null), a.prototype._removeItemInner.call(this, e[i].id), this._move_branch(e[i], this.getParent(e[i]), null)
      }, move: function (t, e, i) {
        var n = arguments[3];
        if (n) {
          if (n === t) return;
          i = this.getParent(n), e = this.getBranchIndex(n)
        }
        if (t != i) {
          i = i || this.$getRootId();
          var r = this.getItem(t), a = this.getParent(r.id), s = this.getChildren(i);
          if (-1 == e && (e = s.length + 1), a == i && this.getBranchIndex(t) == e) return;
          if (!1 !== this.callEvent("onBeforeItemMove", [t, i, e])) {
            this._replace_branch_child(a, t), (s = this.getChildren(i))[e] ? s = s.slice(0, e).concat([t]).concat(s.slice(e)) : s.push(t), this.setParent(r, i), this._branches[i] = s;
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
        this._branches = {}, a.prototype.clearAll.call(this)
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
        for (var a = this.getChildren(r), s = !1, o = 0, l = a.length; o < l; o++) if (a[o] == t.id) {
          s = !0;
          break
        }
        s || (1 * e == e ? a.splice(e, 0, t.id) : a.push(t.id), t.$rendered_parent = r)
      }, _move_branch: function (t, e, i) {
        this._replace_branch_child(e, t.id), this.exists(i) || i == this.$getRootId() ? this._add_branch(t, void 0, i) : delete this._branches[t.id], t.$level = this.calculateItemLevel(t), this.eachItem(function (t) {
          t.$level = this.calculateItemLevel(t)
        }, t.id)
      }, _replace_branch_child: function (t, e, i) {
        var r = this.getChildren(t);
        if (r && void 0 !== t) {
          for (var a = n.$create(), s = 0; s < r.length; s++) r[s] != e ? a.push(r[s]) : i && a.push(i);
          this._branches[t] = a
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
        var a = this.getChildren(i);
        if (a) {
          for (var s = [], o = a.length - 1; o >= 0; o--) s[o] = this.getItem(a[o]);
          for (s.sort(n), o = 0; o < s.length; o++) a[o] = s[o].id, this.sort(t, e, a[o])
        }
      }, filter: function (t) {
        for (var e in this.pull) this.pull[e].$rendered_parent !== this.getParent(this.pull[e]) && this._move_branch(this.pull[e], this.pull[e].$rendered_parent, this.getParent(this.pull[e]));
        return a.prototype.filter.apply(this, arguments)
      }, open: function (t) {
        this.exists(t) && (this.getItem(t).$open = !0, this.callEvent("onItemOpen", [t]))
      }, close: function (t) {
        this.exists(t) && (this.getItem(t).$open = !1, this.callEvent("onItemClose", [t]))
      }, destructor: function () {
        a.prototype.destructor.call(this), this._branches = null
      }
    }, a.prototype), t.exports = s
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
    var n = i(28), r = i(0), a = i(4), s = function (t) {
      return this.pull = {}, this.$initItem = t.initItem, this.visibleOrder = n.$create(), this.fullOrder = n.$create(), this._skip_refresh = !1, this._filterRule = null, this._searchVisibleOrder = {}, this.$config = t, a(this), this
    };
    s.prototype = {
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
    }, t.exports = s
  }, function (t, e) {
    t.exports = function (t) {
      function e(e, a) {
        var s = a.getItemPosition(e), o = a.$getConfig(), l = a.$getTemplates(), c = a.getItemHeight(),
          d = t.getTaskType(e.type), h = Math.floor((t.config.row_height - c) / 2);
        d == o.types.milestone && o.link_line_width > 1 && (h += 1), d == o.types.milestone && (s.left -= Math.round(c / 2), s.width = c);
        var u = document.createElement("div"), f = Math.round(s.width);
        a.$config.item_attribute && u.setAttribute(a.$config.item_attribute, e.id), o.show_progress && d != o.types.milestone && function (e, i, n, r, a) {
          var s = 1 * e.progress || 0;
          n = Math.max(n - 2, 0);
          var o = document.createElement("div"), l = Math.round(n * s);
          l = Math.min(n, l), e.progressColor && (o.style.backgroundColor = e.progressColor, o.style.opacity = 1), o.style.width = l + "px", o.className = "jsgantt-task-background", r.rtl && (o.style.position = "absolute", o.style.right = "0px");
          var c = document.createElement("div");
          if (c.className = "jsgantt-task-progress-wrapper", c.appendChild(o), i.appendChild(c), t.config.drag_progress && !t.isReadonly(e)) {
            var d = document.createElement("div"), h = l;
            r.rtl && (h = n - l), d.style.left = h + "px", d.className = "jsgantt-task-progress-drag", o.appendChild(d), i.appendChild(d)
          }
        }(e, u, f, o);
        var g = function (e, i, n) {
          var r = document.createElement("div");
          r.className = "jsgantt-task-content my-tooltip", r.title = "<b>Order ID:</b>" + e.orderId + "<br/>Repeat every " + e.repeat + "<br/>" + e.begin + " - " + e.end;
          var a = document.createAttribute("data-toggle");
          a.value = "tooltip", r.setAttributeNode(a);
          var s = document.createAttribute("data-html");
          return s.value = "true", r.setAttributeNode(s), t.getTaskType(e.type), t.config.types.milestone, r
        }(e);
        e.textColor && (g.style.color = e.textColor), u.appendChild(g);
        var _ = function (t, e, i, n) {
          let r = ["jsgantt-task-line"];
          return e && r.push(e), r.push("jsgantt-bar-task"), r.join(" ")
        }(0, l.task_class(e.plannedDate, e.end_date, e), e.id);
        (e.color || e.progressColor || e.textColor) && (_ += " jsgantt-task-inline-color"), u.className = _;
        var p = ["left:" + s.left + "px", "top:" + (h + s.top) + "px", "height:" + c + "px", "line-height:" + Math.max(c < 30 ? c - 2 : c, 0) + "px", "width:" + f + "px"];
        e.color && p.push("background-color:" + e.color), e.textColor && p.push("color:" + e.textColor), u.style.cssText = p.join(";");
        var v = function (t, e, r) {
          var a = "jsgantt-left " + n(!o.rtl, t);
          return i(t, r.leftside_text, a)
        }(e, 0, l);
        v && u.appendChild(v), (v = function (t, e, r) {
          var a = "jsgantt-right " + n(!!o.rtl, t);
          return i(t, r.rightside_text, a)
        }(e, 0, l)) && u.appendChild(v), t._waiAria.setTaskBarAttr(e, u);
        var m = t.getState();
        return t.isReadonly(e) || (o.drag_resize && !t.isSummaryTask(e) && d != o.types.milestone && r(u, "jsgantt-task-drag", e, function (t) {
          var e = document.createElement("div");
          return e.className = t, e
        }, o), o.drag_links && o.show_links && r(u, "jsgantt-link-control", e, function (t) {
          var e = document.createElement("div");
          e.className = t, e.style.cssText = ["height:" + c + "px", "line-height:" + c + "px"].join(";");
          var i = document.createElement("div");
          i.className = "jsgantt-link-point";
          var n = !1;
          return m.link_source_id && o.touch && (n = !0), i.style.display = n ? "block" : "", e.appendChild(i), e
        }, o)), u
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
        for (var r in n) for (var a = i[r], s = 0; s < a.length; s++) for (var o = t.getLink(a[s]), l = 0; l < n[r].length; l++) if (o.type == n[r][l]) return "jsgantt-link-crossing";
        return ""
      }

      function r(e, i, n, r, a) {
        var s, o = t.getState();
        +n.plannedDate >= +o.min_date && ((s = r([i, a.rtl ? "task-right" : "task-left", "task-start-date"].join(" "))).setAttribute("data-bind-property", "plannedDate"), e.appendChild(s)), +n.end_date <= +o.max_date && ((s = r([i, a.rtl ? "task-left" : "task-right", "task-end_date"].join(" "))).setAttribute("data-bind-property", "end_date"), e.appendChild(s))
      }

      return function (i, n) {
        var r = n.$getConfig().type_renderers[t.getTaskType(i.type)], a = e;
        return r ? r.call(t, i, function (e) {
          return a.call(t, e, n)
        }, n) : a.call(t, i, n)
      }
    }
  }, function (t, e, i) {
    var n = i(0), r = i(34), a = i(14), s = i(2), o = function (t) {
      function e(e, i, n, r) {
        var a = t.apply(this, arguments) || this;
        return a.$config.bindLinks = null, a
      }

      return s(e, t), n.mixin(e.prototype, {
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
      }, !0), n.mixin(e.prototype, a(e), !0), e
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
    var n = i(33), r = i(4), a = i(0), s = i(32), o = i(129), l = function (t, e, i, s) {
      this.$config = a.mixin({}, e || {}), this.$scaleHelper = new n(s), this.$jsgantt = s, r(this)
    };

    function c(t, e) {
      for (var i, n, r, a = 0, s = t.length - 1; a <= s;) if (n = +t[i = Math.floor((a + s) / 2)], r = +t[i - 1], n < e) a = i + 1; else {
        if (!(n > e)) {
          for (; +t[i] == +t[i + 1];) i++;
          return i
        }
        if (!isNaN(r) && r < e) return i - 1;
        s = i - 1
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
        for (var a = this._tasks, s = this.$task_data.childNodes, o = 0, l = s.length; o < l; o++) {
          var c = s[o];
          c.hasAttribute("data-layer") && c.style && (c.style.width = a.full_width + "px")
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
          for (var r = this.$config.layers, a = 0; r && a < r.length; a++) {
            "string" == typeof (c = r[a]) && (c = this.$jsgantt.$ui.layers[c]), "function" == typeof c && (c = {renderer: c}), c.host = this;
            var s = n.addLayer(c);
            this._taskLayers.push(s), c.expose && (this._taskRenderer = n.getLayer(s))
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
          for (a = 0; l && a < l.length; a++) {
            var c;
            "string" == typeof c && (c = this.$jsgantt.$ui.layers[c]), (c = l[a]).host = this;
            var d = o.addLayer(c);
            this._taskLayers.push(d), l[a].expose && (this._linkRenderer = o.getLayer(d))
          }
        }
      }, _initStaticBackgroundRender: function () {
        var t = this, e = o.create(), i = t.$config.rowStore;
        i && (this._staticBgHandler = i.attachEvent("onStoreUpdated", function (i, n, r) {
          if (null === i && t.isVisible()) {
            var a = t.$getConfig();
            if (a.static_background) {
              var s = t.$jsgantt.getDatastore(t.$config.bind);
              s && e.render(t.$task_bg, a, t.getScale(), a.row_height * s.countVisible())
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
          var a = this.$scaleHelper, s = this._getScales();
          n = t.scale_height;
          var o = this.$config.width;
          "x" != t.autosize && "xy" != t.autosize || (o = Math.max(t.autosize_min_width, 0));
          var l = a.prepareConfigs(s, t.min_column_width, o, n - 1, r.min_date, r.max_date, t.rtl),
            c = this._tasks = l[l.length - 1];
          this._scales = l, e = this._getScaleChunkHtml(l, 0, this.$config.width), i = c.full_width + "px", n += "px"
        }
        this.$task_scale.style.height = n, this.$task_data.style.width = this.$task_scale.style.width = i, this.$task_scale.innerHTML = e
      }, _getScaleChunkHtml: function (t, e, i) {
        for (var n = [], r = this.$jsgantt.$services.templates().scale_row_class, a = 0; a < t.length; a++) {
          var s = "jsgantt-scale-line", o = r(t[a]);
          o && (s += " " + o), n.push('<div class="' + s + '" style="height:' + t[a].height + "px;position:relative;line-height:" + t[a].height + 'px">' + this._prepareScaleHtml(t[a], e, i) + "</div>")
        }
        return n.join("")
      }, _prepareScaleHtml: function (t, e, i) {
        var n = this.$getConfig(), r = this.$jsgantt.$services.templates(), a = [], s = null, o = null, l = null;
        (t.template || t.date) && (o = t.template || this.$jsgantt.date.date_to_str(t.date));
        var d = 0, h = t.count;
        !n.smart_scales || isNaN(e) || isNaN(i) || (d = c(t.left, e), h = c(t.left, i) + 1), l = t.css || function () {
        }, !t.css && n.inherit_scale_class && (l = r.scale_cell_class);
        for (var u = d; u < h && t.trace_x[u]; u++) {
          s = new Date(t.trace_x[u]);
          var f = o.call(this, s), g = t.width[u], _ = t.height, p = t.left[u], v = "", m = "", $ = "";
          if (g) {
            v = "width:" + g + "px;height:" + _ + "px;" + (n.smart_scales ? "position:absolute;left:" + p + "px" : ""), $ = "jsgantt-scale-cell" + (u == t.count - 1 ? " jsgantt-last-cell" : ""), (m = l.call(this, s)) && ($ += " " + m);
            var y = "<div class='" + $ + "'" + this.$jsgantt._waiAria.getTimelineCellAttr(f) + " style='" + v + "'>" + f + "</div>";
            a.push(y)
          }
        }
        return a.join("")
      }, dateFromPos: function (t) {
        var e = this._tasks;
        if (t < 0 || t > e.full_width || !e.full_width) return null;
        var i = c(this._tasks.left, t), n = this._tasks.left[i], r = e.width[i] || e.col_width, a = 0;
        r && (a = (t - n) / r, e.rtl && (a = 1 - a));
        var s = 0;
        return a && (s = this._getColumnDuration(e, e.trace_x[i])), new Date(e.trace_x[i].valueOf() + Math.round(a * s))
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
        var a = c(i, e), s = this._getClosestVisibleColumn(a, i, n), o = i[s], l = this._tasks.trace_index_transition;
        if (!o) return l ? l[0] : 0;
        var d = (t - i[s]) / this._getColumnDuration(this._tasks, i[s]);
        return l ? l[s] + (1 - d) : s + d
      }, getItemPosition: function (t, e, i) {
        var n, r, a;
        return this._tasks.rtl ? (r = this.posFromDate(e || t.plannedDate), n = this.posFromDate(i || t.end_date)) : (n = this.posFromDate(e || t.plannedDate), r = this.posFromDate(i || t.end_date)), a = Math.max(r - n, 0), {
          left: n,
          top: this.getItemTop(t.id),
          height: this.getItemHeight(),
          width: a
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
    }, a.mixin(l.prototype, s()), t.exports = l
  }, function (t, e, i) {
    var n = i(2), r = i(1), a = function (t) {
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
        var i, n = !1, r = [], a = [];

        function s(t) {
          t.$parent.show(), n = !0, r.push(t)
        }

        function o(t) {
          t.$parent.hide(), n = !0, a.push(t)
        }

        for (var l = 0; l < e.length; l++) t[(i = e[l]).$config.scroll] ? o(i) : i.shouldHide() ? o(i) : i.shouldShow() ? s(i) : i.isVisible() ? r.push(i) : a.push(i);
        var c = {};
        for (l = 0; l < r.length; l++) r[l].$config.group && (c[r[l].$config.group] = !0);
        for (l = 0; l < a.length; l++) (i = a[l]).$config.group && c[i.$config.group] && s(i);
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
          var a = t[r].getSize(),
            s = n > 0 ? t[r].$parent.getNextSibling(t[r].$id) : t[r].$parent.getPrevSibling(t[r].$id);
          "resizer" == s.$name && (s = n > 0 ? s.$parent.getNextSibling(s.$id) : s.$parent.getPrevSibling(s.$id));
          var o = s.getSize();
          if (s[i]) {
            var l = a.gravity + o.gravity, c = a[i] + o[i], d = l / c;
            t[r].$config.gravity = d * e, s.$config[i] = c - e, s.$config.gravity = l - d * e
          } else t[r].$config[i] = e;
          var h = this.$jsgantt.$ui.getView("grid");
          h && t[r].$content === h && !h.$config.scrollable && (this.$jsgantt.config.grid_width = e)
        }
      }, e.prototype.resize = function (e) {
        var i = !1;
        if (this.$root && !this._resizeInProgress && (this.callEvent("onBeforeResize", []), i = !0, this._resizeInProgress = !0), t.prototype.resize.call(this, !0), t.prototype.resize.call(this, !1), i) {
          var n = [];
          n = (n = (n = n.concat(this.getCellsByType("viewCell"))).concat(this.getCellsByType("viewLayout"))).concat(this.getCellsByType("hostCell"));
          for (var r = this.getCellsByType("scroller"), a = 0; a < n.length; a++) n[a].$config.hidden || n[a].setContentSize();
          var s = this._getAutosizeMode(this.$config.autosize), o = this._resizeScrollbars(s, r);
          if (this.$config.autosize && (this.autosize(this.$config.autosize), o = !0), o) for (this.resize(), a = 0; a < n.length; a++) n[a].$config.hidden || n[a].setContentSize();
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
          var a = this.$cells[n];
          a.$fill(i[n], this), a.$config.hidden && a.$view.parentNode.removeChild(a.$view)
        }
      }, e.prototype.$toHTML = function () {
        for (var e = this._xLayout ? "x" : "y", i = [], n = 0; n < this.$cells.length; n++) i.push(this.$cells[n].$toHTML());
        return t.prototype.$toHTML.call(this, i.join(""), (this.$root ? "jsgantt-layout-root " : "") + "jsgantt-layout jsgantt-layout-" + e)
      }, e.prototype.getContentSize = function (t) {
        for (var e, i, n, r = 0, a = 0, s = 0; s < this.$cells.length; s++) (i = this.$cells[s]).$config.hidden || (e = i.getContentSize(t), "scrollbar" === i.$config.view && t[i.$config.scroll] && (e.height = 0, e.width = 0), i.$config.resizer && (this._xLayout ? e.height = 0 : e.width = 0), n = i._getBorderSizes(), this._xLayout ? (r += e.width + n.horizontal, a = Math.max(a, e.height + n.vertical)) : (r = Math.max(r, e.width + n.horizontal), a += e.height + n.vertical));
        return r += (n = this._getBorderSizes()).horizontal, a += n.vertical, this.$root && (r += 1, a += 1), {
          width: r,
          height: a
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
        var a = {
          horPaddings: n.paddingLeft + n.paddingRight + n.borderLeftWidth + n.borderRightWidth,
          vertPaddings: n.paddingTop + n.paddingBottom + n.borderTopWidth + n.borderBottomWidth,
          borderBox: n.boxSizing,
          innerWidth: n.width,
          innerHeight: n.height,
          outerWidth: n.width,
          outerHeight: n.height
        };
        return a.borderBox ? (a.innerWidth -= a.horPaddings, a.innerHeight -= a.vertPaddings) : (a.outerWidth += a.horPaddings, a.outerHeight += a.vertPaddings), a
      }, e.prototype._getAutosizeMode = function (t) {
        var e = {x: !1, y: !1};
        return "xy" === t ? e.x = e.y = !0 : "y" === t || !0 === t ? e.y = !0 : "x" === t && (e.x = !0), e
      }, e.prototype.autosize = function (t) {
        var e = this._getAutosizeMode(t), i = this._getBoxStyles(this.$container), n = this.getContentSize(t),
          r = this.$container;
        e.x && (i.borderBox && (n.width += i.horPaddings), r.style.width = n.width + "px"), e.y && (i.borderBox && (n.height += i.vertPaddings), r.style.height = n.height + "px")
      }, e.prototype.getSize = function () {
        this._sizes = [];
        for (var e = 0, i = 0, n = 1e5, r = 0, a = 1e5, s = 0, o = 0; o < this.$cells.length; o++) {
          var l = this._sizes[o] = this.$cells[o].getSize();
          this.$cells[o].$config.hidden || (this._xLayout ? (!l.width && l.minWidth ? e += l.minWidth : e += l.width, n += l.maxWidth, i += l.minWidth, r = Math.max(r, l.height), a = Math.min(a, l.maxHeight), s = Math.max(s, l.minHeight)) : (!l.height && l.minHeight ? r += l.minHeight : r += l.height, a += l.maxHeight, s += l.minHeight, e = Math.max(e, l.width), n = Math.min(n, l.maxWidth), i = Math.max(i, l.minWidth)))
        }
        var c = t.prototype.getSize.call(this);
        return c.maxWidth >= 1e5 && (c.maxWidth = n), c.maxHeight >= 1e5 && (c.maxHeight = a), c.minWidth = c.minWidth != c.minWidth ? 0 : c.minWidth, c.minHeight = c.minHeight != c.minHeight ? 0 : c.minHeight, this._xLayout ? (c.minWidth += this.$config.margin * this.$cells.length || 0, c.minWidth += 2 * this.$config.padding || 0, c.minHeight += 2 * this.$config.padding || 0) : (c.minHeight += this.$config.margin * this.$cells.length || 0, c.minHeight += 2 * this.$config.padding || 0), c
      }, e.prototype._calcFreeSpace = function (t, e, i) {
        var n = i ? e.minWidth : e.minHeight, r = e.maxWidth, a = t;
        return a ? (a > r && (a = r), a < n && (a = n), this._free -= a) : ((a = Math.floor(this._free / this._gravity * e.gravity)) > r && (a = r, this._free -= a, this._gravity -= e.gravity), a < n && (a = n, this._free -= a, this._gravity -= e.gravity)), a
      }, e.prototype._calcSize = function (t, e, i) {
        var n = t, r = i ? e.minWidth : e.minHeight, a = i ? e.maxWidth : e.maxHeight;
        return n || (n = Math.floor(this._free / this._gravity * e.gravity)), n > a && (n = a), n < r && (n = r), n
      }, e.prototype._configureBorders = function () {
        this.$root && this._setBorders([this._borders.left, this._borders.top, this._borders.right, this._borders.bottom], this);
        for (var t = this._xLayout ? this._borders.right : this._borders.bottom, e = this.$cells, i = e.length - 1, n = i; n >= 0; n--) if (!e[n].$config.hidden) {
          i = n;
          break
        }
        for (n = 0; n < e.length; n++) if (!e[n].$config.hidden) {
          var r = n >= i, a = "";
          !r && e[n + 1] && "scrollbar" == e[n + 1].$config.view && (this._xLayout ? r = !0 : a = "jsgantt-layout-cell-border-transparent"), this._setBorders(r ? [] : [t, a], e[n])
        }
      }, e.prototype._updateCellVisibility = function () {
        for (var t, e = this._visibleCells || {}, i = !this._visibleCells, n = {}, r = 0; r < this._sizes.length; r++) t = this.$cells[r], !i && t.$config.hidden && e[t.$id] ? t._hide(!0) : t.$config.hidden || e[t.$id] || t._hide(!1), t.$config.hidden || (n[t.$id] = !0);
        this._visibleCells = n
      }, e.prototype.setSize = function (e, i) {
        this._configureBorders(), t.prototype.setSize.call(this, e, i), i = this.$lastSize.contentY, e = this.$lastSize.contentX;
        var n, r, a = this.$config.padding || 0;
        this.$view.style.padding = a + "px", this._gravity = 0, this._free = this._xLayout ? e : i, this._free -= 2 * a, this._updateCellVisibility();
        for (var s = 0; s < this._sizes.length; s++) if (!(n = this.$cells[s]).$config.hidden) {
          var o = this.$config.margin || 0;
          "resizer" != n.$name || o || (o = -1);
          var l = n.$view, c = this._xLayout ? "marginRight" : "marginBottom";
          s !== this.$cells.length - 1 && (l.style[c] = o + "px", this._free -= o), r = this._sizes[s], this._xLayout ? r.width || (this._gravity += r.gravity) : r.height || (this._gravity += r.gravity)
        }
        for (s = 0; s < this._sizes.length; s++) if (!(n = this.$cells[s]).$config.hidden) {
          var d = (r = this._sizes[s]).width, h = r.height;
          this._xLayout ? this._calcFreeSpace(d, r, !0) : this._calcFreeSpace(h, r, !1)
        }
        for (s = 0; s < this.$cells.length; s++) if (!(n = this.$cells[s]).$config.hidden) {
          r = this._sizes[s];
          var u = void 0, f = void 0;
          this._xLayout ? (u = this._calcSize(r.width, r, !0), f = i - 2 * a) : (u = e - 2 * a, f = this._calcSize(r.height, r, !1)), n.setSize(u, f)
        }
      }, e
    }(i(6));
    t.exports = a
  }, function (t, e) {
    var i, n, r = t.exports = {};

    function a() {
    }

    function s() {
    }

    function o(t) {
      if (i === setTimeout) return setTimeout(t, 0);
      if ((i === a || !i) && setTimeout) return i = setTimeout, setTimeout(t, 0);
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
        i = "function" == typeof setTimeout ? setTimeout : a
      } catch (t) {
        i = a
      }
      try {
        n = "function" == typeof clearTimeout ? clearTimeout : s
      } catch (t) {
        n = s
      }
    }();
    var l, c = [], d = !1, h = -1;

    function u() {
      d && l && (d = !1, l.length ? c = l.concat(c) : h = -1, c.length && f())
    }

    function f() {
      if (!d) {
        var t = o(u);
        d = !0;
        for (var e = c.length; e;) {
          for (l = c, c = []; ++h < e;) l && l[h].run();
          h = -1, e = c.length
        }
        l = null, d = !1, function (t) {
          if (n === clearTimeout) return clearTimeout(t);
          if ((n === s || !n) && clearTimeout) return n = clearTimeout, clearTimeout(t);
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
      c.push(new g(t, e)), 1 !== c.length || d || o(f)
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

      function a(t, e) {
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
          e.className = "jsgantt-container-resize-watcher", e.tabIndex = -1, t.$root.appendChild(e), e.contentWindow ? a(t, e.contentWindow) : (t.$root.removeChild(e), a(t, window))
        }(t), this.callEvent("onTemplatesReady", []), this.$mouseEvents.reset(this.$root), this.callEvent("onGanttReady", []), this.render()
      }, t.$click = {}, t.render = function () {
        this.callEvent("onBeforeGanttRender", []), !this.config.sort && this._sort && (this._sort = void 0);
        var i = this.getScrollState(), n = i ? i.x : 0;
        this._getHorizontalScrollbar() && (n = this._getHorizontalScrollbar().$config.codeScrollLeft || n || 0);
        var r = null;
        if (n && (r = t.dateFromPos(n + this.config.task_scroll_offset)), e(this), this.$layout.$config.autosize = this.config.autosize, this.$layout.resize(), this.config.preserve_scroll && i && n) {
          var a = t.getScrollState();
          +r == +t.dateFromPos(a.x) && a.y == i.y || (r && this.showDate(r), i.y && t.scrollTo(void 0, i.y))
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
        var a = !0;
        return this.checkEvent("onLinkValidation") && (a = this.callEvent("onLinkValidation", [r])), a
      }, t._correct_dst_change = function (e, i, n, a) {
        var s = r.getSecondsInUnit(a) * n;
        if (s > 3600 && s < 86400) {
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
        date: {
          month_full: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
          month_short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          day_full: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          day_short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        }
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
      t._touch_events = function (n, r, a) {
        for (var s, o = 0, l = !1, c = !1, d = null, h = null, u = null, f = 0; f < i.length; f++) t.eventRemove(i[f][0], i[f][1], i[f][2]);
        for ((i = []).push([t.$container, n[0], function (i) {
          var n = e();
          if (!a(i) && l) {
            h && clearTimeout(h);
            var u = r(i);
            if (n && (n.drag.id || n.drag.start_drag)) return n.on_mouse_move(u), i.preventDefault && i.preventDefault(), i.cancelBubble = !0, !1;
            if (!t._prevent_touch_scroll) {
              if (u && d) {
                var f = d.pageX - u.pageX, _ = d.pageY - u.pageY;
                if (!c && (Math.abs(f) > 5 || Math.abs(_) > 5) && (t._touch_scroll_active = c = !0, o = 0, s = t.getScrollState()), c) {
                  t.scrollTo(s.x + f, s.y + _);
                  var p = t.getScrollState();
                  if (s.x != p.x && _ > 2 * f || s.y != p.y && f > 2 * _) return g(i)
                }
              }
              return g(i)
            }
            return !0
          }
        }]), i.push([this.$container, "contextmenu", function (t) {
          if (l) return g(t)
        }]), i.push([this.$container, n[1], function (i) {
          if (!a(i)) if (i.touches && i.touches.length > 1) l = !1; else {
            d = r(i), t._locate_css(d, "jsgantt-hor-scroll") || t._locate_css(d, "jsgantt-ver-scroll") || (l = !0);
            var n = e();
            h = setTimeout(function () {
              var e = t.locate(d);
              n && e && !t._locate_css(d, "jsgantt-link-control") && !t._locate_css(d, "jsgantt-grid-data") && (n.on_mouse_down(d), n.drag && n.drag.start_drag && (function (e) {
                var i = t._getTaskLayers(), n = t.getTask(e);
                if (n && t.isTaskVisible(e)) for (var r = 0; r < i.length; r++) if ((n = i[r].rendered[e]) && n.getAttribute(t.config.task_attribute) && n.getAttribute(t.config.task_attribute) == e) {
                  var a = n.cloneNode(!0);
                  u = n, i[r].rendered[e] = a, n.style.display = "none", a.className += " jsgantt-drag-move ", n.parentNode.appendChild(a)
                }
              }(e), n._start_dnd(d), t._touch_drag = !0, t.refreshTask(e), t._touch_feedback())), h = null
            }, t.config.touch_drag)
          }
        }]), i.push([this.$container, n[2], function (i) {
          if (!a(i)) {
            h && clearTimeout(h), t._touch_drag = !1, l = !1;
            var n = r(i), s = e();
            if (s && s.on_mouse_up(n), u && (t.refreshTask(t.locate(u)), u.parentNode && (u.parentNode.removeChild(u), t._touch_feedback())), t._touch_scroll_active = l = c = !1, u = null, d && o) {
              var f = new Date;
              f - o < 500 ? g(i) : o = f
            } else o = new Date
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
      var i = {grid_width: 350, row_height: 23, scale_height: 30, link_line_width: 2, link_arrow_size: 6}, n = 95,
        a = 80;
      !function (t, e, i) {
        for (var n in e) (void 0 === t[n] || i) && (t[n] = e[n])
      }(e.config, i, t);
      var s = e.getGridColumns();
      for (s[1] && !e.defined(s[1].width) && (s[1].width = n), s[2] && !e.defined(s[2].width) && (s[2].width = a), r = 0; r < s.length; r++) {
        var o = s[r];
        "add" == o.name && (o.width || (o.width = 44), e.defined(o.min_width) && e.defined(o.max_width) || (o.min_width = o.min_width || o.width, o.max_width = o.max_width || o.width), o.min_width && (o.min_width = +o.min_width), o.max_width && (o.max_width = +o.max_width), o.width && (o.width = +o.width, o.width = o.min_width && o.min_width > o.width ? o.min_width : o.width, o.width = o.max_width && o.max_width < o.width ? o.max_width : o.width))
      }
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
              for (var e = new Array(arguments.length), r = 0, a = arguments.length; r < a; r++) e[r] = arguments[r];
              if (n.active) {
                var s = n.get_arguments_hash(Array.prototype.slice.call(e));
                n.cache[t] || (n.cache[t] = {});
                var o = n.cache[t];
                if (n.has_cached_value(o, s)) return n.get_cached_value(o, s);
                var l = i.apply(this, e);
                return n.cache_value(o, s, l), l
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
        var n = t.config.types, r = t.locale.labels, a = [], s = i.filter || function (t, e) {
          return !n.placeholder || e !== n.placeholder
        };
        for (var o in n) 0 == !s(o, n[o]) && a.push({key: n[o], label: r["type_" + o]});
        return i.options = a, i.onchange, i.onchange = function () {
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
    i(11);
    t.exports = function (t) {
      var e = i(5)(t);

      function r() {
        return e.apply(this, arguments) || this
      }

      return n(r, e), r
    }
  }, function (t, e, i) {
    i(3), i(1), i(11), i(2);
    t.exports = function (t) {
      i(5)(t)
    }
  }, function (t, e, i) {
    var n = i(2);
    t.exports = function (t) {
      var e = i(12)(t);

      function r() {
        return e.apply(this, arguments) || this
      }

      function a(e, i) {
        var n = [], r = [];
        i && (n = t.getTaskByTime(), e.allow_root && n.unshift({
          id: t.config.root_id,
          orderId: e.root_label || ""
        }), n = function (e, i, n) {
          var r = i.filter || function () {
            return !0
          };
          e = e.slice(0);
          for (var a = 0; a < e.length; a++) {
            var s = e[a];
            (s.id == n || t.isChildOf(s.id, n) || !1 === r(s.id, s)) && (e.splice(a, 1), a--)
          }
          return e
        }(n, e, i), e.sort && n.sort(e.sort));
        for (var a = e.template || t.templates.task_text, s = 0; s < n.length; s++) {
          var o = a.apply(t, [n[s].plannedDate, n[s].end_date, n[s]]);
          void 0 === o && (o = ""), r.push({key: n[s].id, label: o})
        }
        return e.options = r, e.map_to = e.map_to || "parent", t.form_blocks.select.render.apply(this, arguments)
      }

      return n(r, e), r.prototype.render = function (t) {
        return a(t, !1)
      }, r.prototype.set_value = function (e, i, n, r) {
        var s = document.createElement("div");
        s.innerHTML = a(r, n.id);
        var o = s.removeChild(s.firstChild);
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
      var e = i(64)(t), n = i(62)(t), r = i(59)(t), a = i(58)(t);
      t.form_blocks = {template: new e, time: new n, duration: new r, parent: new a}
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
          var a = t.getTaskByIndex(0);
          r = a ? a.plannedDate ? a.plannedDate : a.end_date ? t.calculateEndDate({
            plannedDate: a.end_date,
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
          var i = this.getTask(t), n = this.getParent(i), r = this._get_task_timing_mode(i), a = !0;
          if (r.$no_start || r.$no_end) {
            var s = i.plannedDate.valueOf(), o = i.end_date.valueOf();
            s == i.plannedDate.valueOf() && o == i.end_date.valueOf() && (a = !1), a && !e && this.refreshTask(i.id, !0)
          }
          a && n && this.isTaskExists(n) && this._update_parents(n, e)
        }
      }, t.roundDate = function (e) {
        var i = t.getScale();
        n.isDate(e) && (e = {
          date: e,
          unit: i ? i.unit : t.config.durationUnit,
          step: i ? i.step : t.config.durationStep
        });
        var r, a, s, o = e.date, l = e.step, c = e.unit;
        if (!i) return o;
        if (c == i.unit && l == i.step && +o >= +i.min_date && +o <= +i.max_date) s = Math.floor(t.columnIndexByDate(o)), i.trace_x[s] || (s -= 1, i.rtl && (s = 0)), a = new Date(i.trace_x[s]), r = t.date.add(a, l, c); else {
          for (s = Math.floor(t.columnIndexByDate(o)), r = t.date[c + "_start"](new Date(i.min_date)), i.trace_x[s] && (r = t.date[c + "_start"](i.trace_x[s])); +r < +o;) {
            var d = (r = t.date[c + "_start"](t.date.add(r, l, c))).getTimezoneOffset();
            r = t._correct_dst_change(r, d, r, c), t.date[c + "_start"] && (r = t.date[c + "_start"](r))
          }
          a = t.date.add(r, -1 * l, c)
        }
        return e.dir && "future" == e.dir ? r : e.dir && "past" == e.dir ? a : Math.abs(o - a) < Math.abs(r - o) ? a : r
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
        var r = this.$jsgantt.date, a = {week: 6048e5, day: 864e5, hour: 36e5, minute: 6e4}, s = 0;
        if (a[i]) s = Math.round((e - t) / (n * a[i])); else {
          for (var o = new Date(t), l = new Date(e); o.valueOf() < l.valueOf();) s += 1, o = r.add(o, n, i);
          o.valueOf() != e.valueOf() && (s += (l - o) / (r.add(o, n, i) - o))
        }
        return Math.round(s)
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

    function a(t) {
      this.$jsgantt = t.$jsgantt, this.argumentsHelper = n(this.$jsgantt), this.calendarManager = t, this.$disabledCalendar = new r(this.$jsgantt, this.argumentsHelper)
    }

    a.prototype = {
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
    }, t.exports = a
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

    function a(t, e) {
      this.argumentsHelper = e, this.$jsgantt = t, this._workingUnitsCache = n.createCacheObject()
    }

    a.prototype = {
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
        var r = this.$jsgantt.date, a = new Date(t), s = new Date(e);
        n = n || 1;
        var o, l, c = 0, d = null, h = !1;
        (o = r[i + "_start"](new Date(a))).valueOf() != a.valueOf() && (h = !0);
        var u = !1;
        (l = r[i + "_start"](new Date(e))).valueOf() != e.valueOf() && (u = !0);
        for (var f = !1; a.valueOf() < s.valueOf();) f = (d = this._nextDate(a, i, n)).valueOf() > s.valueOf(), this._isWorkTime(a, i) && ((h || u && f) && (o = r[i + "_start"](new Date(a)), l = r.add(o, n, i)), h ? (h = !1, d = this._nextDate(o, i, n), c += (l.valueOf() - a.valueOf()) / (l.valueOf() - o.valueOf())) : u && f ? (u = !1, c += (s.valueOf() - a.valueOf()) / (l.valueOf() - o.valueOf())) : c++), a = d;
        return c
      }, _getMinutesPerDay: function (t) {
        return 60 * this._getHoursPerDay(t)
      }, _getHoursPerDay: function (t) {
        for (var e = this._getWorkHours(t), i = 0, n = 0; n < e.length; n += 2) i += e[n + 1] - e[n] || 0;
        return i
      }, _getWorkUnitsForRange: function (t, e, i, n) {
        var a, s = 0, o = new Date(t), l = new Date(e);
        for (a = "minute" == i ? r.bind(this._getMinutesPerDay, this) : r.bind(this._getHoursPerDay, this); o.valueOf() < l.valueOf();) this._isWorkTime(o, "day") && (s += a(o)), o = this._nextDate(o, "day", 1);
        return s / n
      }, _getWorkUnitsBetweenQuick: function (t, e, i, n) {
        var r = new Date(t), a = new Date(e);
        n = n || 1;
        var s = new Date(r), o = this.$jsgantt.date.add(this.$jsgantt.date.day_start(new Date(r)), 1, "day");
        if (a.valueOf() <= o.valueOf()) return this._getWorkUnitsBetweenGeneric(t, e, i, n);
        var l = this.$jsgantt.date.day_start(new Date(a)), c = a, d = this._getWorkUnitsBetweenGeneric(s, o, i, n),
          h = this._getWorkUnitsBetweenGeneric(l, c, i, n);
        return d + this._getWorkUnitsForRange(o, l, i, n) + h
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
        var a = new Date(e), s = new Date(i);
        for (r = r || 1; a.valueOf() < s.valueOf();) {
          if (this._isWorkTime(a, n)) return !0;
          a = this._nextDate(a, n, r)
        }
        return !1
      }, calculateEndDate: function () {
        var t = this.argumentsHelper.calculateEndDateArguments.apply(this.argumentsHelper, arguments),
          e = t.plannedDate, i = t.duration, n = t.unit, r = t.step;
        if (!n) return !1;
        var a = t.duration >= 0 ? 1 : -1;
        return i = Math.abs(1 * i), this._calculateEndDate(e, i, n, r * a)
      }, _calculateEndDate: function (t, e, i, n) {
        return !!i && (1 == n && "minute" == i ? this._calculateMinuteEndDate(t, e, n) : 1 == n && "hour" == i ? this._calculateHourEndDate(t, e, n) : this._addInterval(t, e, i, n, null).end)
      }, _addInterval: function (t, e, i, n, r) {
        for (var a = 0, s = t; a < e && (!r || !r(s));) {
          var o = this._nextDate(s, i, n);
          this._isWorkTime(n > 0 ? new Date(o.valueOf() - 1) : new Date(o.valueOf() + 1), i) && a++, s = o
        }
        return {end: s, satrt: t, added: a}
      }, _calculateHourEndDate: function (t, e, i) {
        var n = new Date(t), r = 0;
        i = i || 1, e = Math.abs(1 * e);
        var a = this._addInterval(n, e, "hour", i, function (t) {
          return !(t.getHours() || t.getMinutes() || t.getSeconds() || t.getMilliseconds())
        });
        if (r = a.added, n = a.end, (c = e - r) && c > 24) {
          for (var s = n; r < e;) {
            var o = this._nextDate(s, "day", i);
            if (this._isWorkTime(i > 0 ? new Date(o.valueOf() - 1) : new Date(o.valueOf() + 1), "day")) {
              var l = this._getHoursPerDay(s);
              if (r + l >= e) break;
              r += l
            }
            s = o
          }
          n = s
        }
        if (r < e) {
          var c = e - r;
          n = (a = this._addInterval(n, c, "hour", i, null)).end
        }
        return n
      }, _calculateMinuteEndDate: function (t, e, i) {
        var n = new Date(t), r = 0;
        i = i || 1, e = Math.abs(1 * e);
        var a = this._addInterval(n, e, "minute", i, function (t) {
          return !(t.getMinutes() || t.getSeconds() || t.getMilliseconds())
        });
        if (r = a.added, n = a.end, r < e) {
          var s = e - r, o = Math.floor(s / 60);
          o && (n = this._calculateEndDate(n, o, "hour", i > 0 ? 1 : -1), r += 60 * o)
        }
        if (r < e) {
          var l = e - r;
          n = (a = this._addInterval(n, l, "minute", i, null)).end
        }
        return n
      }, getClosestWorkTime: function () {
        var t = this.argumentsHelper.getClosestWorkTimeArguments.apply(this.argumentsHelper, arguments);
        return this._getClosestWorkTime(t.date, t.unit, t.dir)
      }, _getClosestWorkTime: function (t, e, i) {
        var n = new Date(t);
        if (this._isWorkTime(n, e)) return n;
        if (n = this.$jsgantt.date[e + "_start"](n), "any" != i && i) n = "past" == i ? this._getClosestWorkTimePast(n, e) : this._getClosestWorkTimeFuture(n, e); else {
          var r = this._getClosestWorkTimeFuture(n, e), a = this._getClosestWorkTimePast(n, e);
          n = Math.abs(r - t) <= Math.abs(t - a) ? r : a
        }
        return n
      }, _getClosestWorkTimeFuture: function (t, e) {
        return this._getClosestWorkTimeGeneric(t, e, 1)
      }, _getClosestWorkTimePast: function (t, e) {
        var i = this._getClosestWorkTimeGeneric(t, e, -1);
        return this.$jsgantt.date.add(i, 1, e)
      }, _getClosestWorkTimeGeneric: function (t, e, i) {
        for (var n = this._getUnitOrder(e), r = this.units[n - 1], a = t, s = 0; !this._isWorkTime(a, e) && (!r || this._isWorkTime(a, r) || (a = this._getClosestWorkTimeGeneric(a, r, i), !this._isWorkTime(a, e)));) {
          if (++s > 3e3) return this.$jsgantt.assert(!1, "Invalid working time check"), !1;
          var o = a.getTimezoneOffset();
          a = this.$jsgantt.date.add(a, i, e), a = this.$jsgantt._correct_dst_change(a, o, i, e), this.$jsgantt.date[e + "_start"] && (a = this.$jsgantt.date[e + "_start"](a))
        }
        return a
      }
    }, t.exports = a
  }, function (t, e, i) {
    i(0), i(24), i(73), t.exports = function (t) {
      this.$jsgantt = t
    }
  }, function (t, e, i) {
    var n = i(74), r = i(69), a = i(67), s = i(0);
    t.exports = function (t) {
      var e = new n(t), i = new r(e), o = a.create(e, i);
      s.mixin(t, o)
    }
  }, function (t, e, i) {
    var n = i(3);
    t.exports = function (t) {
      t.load = function (t, e, i) {
        this._load_url = t, this.assert(arguments.length, "Invalid load arguments");
        var n = "json";
        return arguments.length >= 3 ? (n = e, i) : "string" == typeof arguments[1] ? n = arguments[1] : "function" == typeof arguments[1] && arguments[1], this._load_type = n, this.callEvent("onLoadStart", [t, n])
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
          for (var a = 0; a < n.length; a++) {
            var s = n[a], o = this.copy(s);
            for (var l in o.key = o.value, s) if (s.hasOwnProperty(l)) {
              if ("value" == l || "label" == l) continue;
              o[l] = s[l]
            }
            r.push(o)
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

      function a(t) {
        return (t + "").replace(r, "&#39;")
      }

      for (var s in t._waiAria = {
        getAttributeString: function (t) {
          var e = [" "];
          for (var i in t) {
            var r = a(n(t[i]));
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
          var r = t.config.links, a = e.type == r.finish_to_start || e.type == r.start_to_start,
            s = e.type == r.start_to_start || e.type == r.start_to_finish,
            o = t.locale.labels.link + " " + t.templates.drag_link(e.source, s, e.target, a);
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
      }, t._waiAria) t._waiAria[s] = function (e) {
        return function () {
          return t.config.wai_aria_attributes ? e.apply(this, arguments) : ""
        }
      }(t._waiAria[s])
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
      function e(e) {
        return function () {
          return !t.config.auto_types || e.apply(this, arguments)
        }
      }

      function i(e) {
        t.batchUpdate(function () {
          !function e(i) {
            !function (e) {
              e = e.id || e;
              var i = t.getTask(e), n = a(i);
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

      function a(e) {
        var i = t.config.types, n = t.hasChild(e.id), r = t.getTaskType(e.type);
        return n && r === i.task ? i.project : !n && !1
      }

      var s, o, l = !0;

      function c(e) {
        e != t.config.root_id && t.isTaskExists(e) && i(e)
      }

      t.attachEvent("onParse", e(function () {
        l = !1, t.batchUpdate(function () {
          t.eachTask(function (t) {
            var e = a(t);
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
        return s = t.getParent(e), !0
      })), t.attachEvent("onRowDragEnd", e(function (t, e) {
        c(s), i(t)
      })), t.attachEvent("onBeforeTaskMove", e(function (e, i, n) {
        return o = t.getParent(e), !0
      })), t.attachEvent("onAfterTaskMove", e(function (t, e, n) {
        document.querySelector(".jsgantt-drag-marker") || (c(o), i(t))
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
          for (var a, s = r.join("_") + "_" + i, o = {}, l = 0; l < r.length; l++) o[r[l]] = !0;
          return e[s] ? a = e[s] : (a = e[s] = [], t.eachTask(function (t) {
            var e;
            e = n.isArray(t[i]) ? t[i] : [t[i]], n.forEach(e, function (e) {
              e && (o[e] || o[e.resource_id]) && a.push(t)
            })
          })), a
        }

        function a(n, r, a, s) {
          var o = n.id + "_" + r + "_" + a.unit + "_" + a.step;
          return e[o] ? e[o] : e[o] = function (e, n, r, a) {
            _ = "task" == e.$role ? [] : i(n, e.id);
            for (var s = r.unit, o = {}, l = 0; l < _.length; l++) for (var c = _[l], d = t.date[s + "_start"](new Date(c.plannedDate)); d < c.end_date;) {
              var h = d;
              if (d = t.date.add(d, 1, s), t.isWorkTime({date: h, task: c, unit: s})) {
                var u = h.valueOf();
                o[u] || (o[u] = []), o[u].push(c)
              }
            }
            var f, g, _, p = [], v = a.$getConfig();
            for (l = 0; l < r.trace_x.length; l++) f = new Date(r.trace_x[l]), g = t.date.add(f, 1, s), ((_ = o[f.valueOf()] || []).length || v.resource_render_empty_cells) && p.push({
              plannedDate: f,
              end_date: g,
              tasks: _
            });
            return p
          }(n, r, a, s)
        }

        function s(t, e, i, n) {
          var r = 100 * (1 - (1 * t || 0)), a = n.posFromDate(e), s = n.posFromDate(i),
            o = document.createElement("div");
          return o.className = "jsgantt-histogram-hor-bar", o.style.top = r + "%", o.style.left = a + "px", o.style.width = s - a + 1 + "px", o
        }

        function o(t, e, i) {
          if (t === e) return null;
          var n = 1 - Math.max(t, e), r = Math.abs(t - e), a = document.createElement("div");
          return a.className = "jsgantt-histogram-vert-bar", a.style.top = 100 * n + "%", a.style.height = 100 * r + "%", a.style.left = i + "px", a
        }

        function l(e, i, n) {
          var r = t.config.resource_property, a = [];
          if (t.getDatastore("task").exists(i)) {
            var s = t.getTask(i);
            a = s[r] || []
          }
          Array.isArray(a) || (a = [a]);
          for (var o = 0; o < a.length; o++) a[o].resource_id == e && n.push({
            task_id: s.id,
            resource_id: a[o].resource_id,
            value: a[o].value
          })
        }

        return t.$data.tasksStore.attachEvent("onStoreUpdated", function () {
          e = {}
        }), {
          renderLine: function (t, e) {
            for (var i = e.$getConfig(), n = e.$getTemplates(), r = a(t, i.resource_property, e.getScale(), e), s = [], o = 0; o < r.length; o++) {
              var l = r[o], c = n.resource_cell_class(l.plannedDate, l.end_date, t, l.tasks),
                d = n.resource_cell_value(l.plannedDate, l.end_date, t, l.tasks);
              if (c || d) {
                var h = e.getItemPosition(t, l.plannedDate, l.end_date), u = document.createElement("div");
                u.className = ["jsgantt-resource-marker", c].join(" "), u.style.cssText = ["left:" + h.left + "px", "width:" + h.width + "px", "height:" + (i.row_height - 1) + "px", "line-height:" + (i.row_height - 1) + "px", "top:" + h.top + "px"].join(";"), d && (u.innerHTML = d), s.push(u)
              }
            }
            var f = null;
            if (s.length) for (f = document.createElement("div"), o = 0; o < s.length; o++) f.appendChild(s[o]);
            return f
          }, renderHistogram: function (e, i) {
            for (var n = i.$getConfig(), r = i.$getTemplates(), l = a(e, n.resource_property, i.getScale(), i), c = [], d = {}, h = e.capacity || i.$config.capacity || 24, u = 0; u < l.length; u++) {
              var f = l[u], g = r.histogram_cell_class(f.plannedDate, f.end_date, e, f.tasks),
                _ = r.histogram_cell_label(f.plannedDate, f.end_date, e, f.tasks),
                p = r.histogram_cell_allocated(f.plannedDate, f.end_date, e, f.tasks),
                v = r.histogram_cell_capacity(f.plannedDate, f.end_date, e, f.tasks);
              if (d[f.plannedDate.valueOf()] = v || 0, g || _) {
                var m = i.getItemPosition(e, f.plannedDate, f.end_date), $ = document.createElement("div");
                $.className = ["jsgantt-histogram-cell", g].join(" "), $.style.cssText = ["left:" + m.left + "px", "width:" + m.width + "px", "height:" + (n.row_height - 1) + "px", "line-height:" + (n.row_height - 1) + "px", "top:" + (m.top + 1) + "px"].join(";"), _ && (_ = "<div class='jsgantt-histogram_label'>" + _ + "</div>"), p && (_ = "<div class='jsgantt-histogram-fill' style='height:" + 100 * Math.min(p / h || 0, 1) + "%;'></div>" + _), _ && ($.innerHTML = _), c.push($)
              }
            }
            var y = null;
            if (c.length) {
              for (y = document.createElement("div"), u = 0; u < c.length; u++) y.appendChild(c[u]);
              var k = function (e, i, n) {
                for (var r = i.getScale(), a = document.createElement("div"), l = 0; l < r.trace_x.length; l++) {
                  var c = r.trace_x[l], d = r.trace_x[l + 1] || t.date.add(c, r.step, r.unit),
                    h = r.trace_x[l].valueOf(), u = Math.min(e[h] / n, 1) || 0;
                  if (u < 0) return null;
                  var f = Math.min(e[d.valueOf()] / n, 1) || 0, g = s(u, c, d, i);
                  g && a.appendChild(g);
                  var _ = o(u, f, i.posFromDate(d));
                  _ && a.appendChild(_)
                }
                return a
              }(d, i, h);
              k && (k.setAttribute("data-resource-id", e.id), k.style.position = "absolute", k.style.top = m.top + 1 + "px", k.style.height = n.row_height - 1 + "px", k.style.left = 0, y.appendChild(k))
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
              var t = window.jsgantt;
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
              var a = t.getChildren(n), s = 1 * i[r] - 1;
              if (!t.isTaskExists(a[s])) return null;
              n = a[s]
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
                  var a = t.getParent(i.id);
                  this._setWBSCode(i, t.getTask(a).$wbs + ".1")
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
            r && (n = this._dp.updateMode, this._dp.setUpdateMode("off"));
            e = !1, i || this.render(), r && (this._dp.setUpdateMode(n), this._dp.setGanttMode("task"), this._dp.sendData(), this._dp.setGanttMode("link"), this._dp.sendData())
          }
        }
      }(t)
    }
  }, function (t, e, i) {
    var n = i(1);
    t.exports = function (t) {
      var e = 50, i = 30, r = 10, a = 50, s = null, o = !1, l = null, c = {started: !1}, d = {};

      function h() {
        var e = !!document.querySelector(".jsgantt-drag-marker"),
          i = !!document.querySelector(".jsgantt-drag-marker.jsgantt-grid-resize-area"),
          n = !!document.querySelector(".jsgantt-link-direction");
        return o = e && !i && !n, !(!t.getState().drag_mode && !e || i)
      }

      function u(e) {
        if (l && (clearTimeout(l), l = null), e) {
          var i = t.config.autoscroll_speed;
          i && i < 10 && (i = 10), l = setTimeout(function () {
            s = setInterval(_, i || a)
          }, t.config.autoscroll_delay || r)
        }
      }

      function f(t) {
        t ? (u(!0), c.started || (c.x = d.x, c.y = d.y, c.started = !0)) : (s && (clearInterval(s), s = null), u(!1), c.started = !1)
      }

      function g(e) {
        var i = h();
        if (!s && !l || i || f(!1), !t.config.autoscroll || !i) return !1;
        d = {x: e.clientX, y: e.clientY}, !s && i && f(!0)
      }

      function _() {
        if (!h()) return f(!1), !1;
        var e = n.getNodePosition(t.$task || t.$grid || t.$root), r = d.x - e.x, a = d.y - e.y,
          s = o ? 0 : p(r, e.width, c.x - e.x), l = p(a, e.height, c.y - e.y), u = t.getScrollState(), g = u.y,
          _ = u.inner_height, v = u.height, m = u.x, $ = u.inner_width, y = u.width;
        l && !_ ? l = 0 : l < 0 && !g ? l = 0 : l > 0 && g + _ >= v + 2 && (l = 0), s && !$ ? s = 0 : s < 0 && !m ? s = 0 : s > 0 && m + $ >= y && (s = 0);
        var k = t.config.autoscroll_step;
        k && k < 2 && (k = 2), l *= k || i, ((s *= k || i) || l) && function (e, i) {
          var n = t.getScrollState(), r = null, a = null;
          e && (r = n.x + e, r = Math.min(n.width, r), r = Math.max(0, r)), i && (a = n.y + i, a = Math.min(n.height, a), a = Math.max(0, a)), t.scrollTo(r, a)
        }(s, l)
      }

      function p(t, i, n) {
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

        function a(i) {
          for (var n = t.updatedRows.slice(), r = !1, a = 0; a < n.length && !t._in_progress[i]; a++) n[a] === i && ("inserted" === e.getUserData(i, "!nativeeditor_status") && (r = !0), t.setUpdated(i, !1));
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
          if (t.setGanttMode("tasks"), !a(i)) {
            if (e.config.cascade_delete && r[i]) {
              var s = t.updateMode;
              t.setUpdateMode("off");
              var o = r[i];
              for (var l in o.tasks) a(l) || t.setUpdated(l, !0, "deleted");
              for (var l in t.setGanttMode("links"), o.links) a(l) || t.setUpdated(l, !0, "deleted");
              r[i] = null, "off" !== s && t.sendAllData(), t.setGanttMode("tasks"), t.setUpdateMode(s)
            }
            t.setUpdated(i, !0, "deleted"), "off" === t.updateMode || t._tSend || t.sendAllData()
          }
        })), this._dataProcessorHandlers.push(e.attachEvent("onAfterLinkUpdate", function (i, n) {
          e.isLinkExists(i) && (t.setGanttMode("links"), t.setUpdated(i, !0))
        })), this._dataProcessorHandlers.push(e.attachEvent("onAfterLinkAdd", function (i, n) {
          e.isLinkExists(i) && (t.setGanttMode("links"), t.setUpdated(i, !0, "inserted"))
        })), this._dataProcessorHandlers.push(e.attachEvent("onAfterLinkDelete", function (e, i) {
          t.setGanttMode("links"), !a(e) && t.setUpdated(e, !0, "deleted")
        })), this._dataProcessorHandlers.push(e.attachEvent("onRowDragEnd", function (t, i) {
          e._sendTaskOrder(t, e.getTask(t))
        }));
        var s = null, o = null;
        this._dataProcessorHandlers.push(e.attachEvent("onTaskIdChange", function (i, n) {
          if (t._waitMode) {
            var r = e.getChildren(n);
            if (r.length) {
              s = s || {};
              for (var a = 0; a < r.length; a++) {
                var l = this.getTask(r[a]);
                s[l.id] = l
              }
            }
            var c = function (t) {
              var e = [];
              return t.$source && (e = e.concat(t.$source)), t.$target && (e = e.concat(t.$target)), e
            }(this.getTask(n));
            if (c.length) for (o = o || {}, a = 0; a < c.length; a++) {
              var d = this.getLink(c[a]);
              o[d.id] = d
            }
          }
        })), t.attachEvent("onAfterUpdateFinish", function () {
          (s || o) && (e.batchUpdate(function () {
            for (var t in s) e.updateTask(s[t].id);
            for (var t in o) e.updateLink(o[t].id);
            s = null, o = null
          }), s ? e._dp.setGanttMode("tasks") : e._dp.setGanttMode("links"))
        }), t.attachEvent("insertCallback", function (t, i, n, r) {
          var a = t.data, s = {add: e.addTask, isExist: e.isTaskExists};
          "links" === r && (s.add = e.addLink, s.isExist = e.isLinkExists), s.isExist.call(e, i) || (a.id = i, s.add.call(e, a))
        }), t.attachEvent("updateCallback", function (t, i) {
          var n = t.data;
          if (e.isTaskExists(i)) {
            var r = e.getTask(i);
            for (var a in n) {
              var s = n[a];
              switch (a) {
                case"id":
                  continue;
                case"plannedDate":
                case"end_date":
                  s = e.templates.dateFormat(s);
                  break;
                case"duration":
                  r.end_date = e.calculateEndDate({plannedDate: r.plannedDate, duration: s, task: r})
              }
              r[a] = s
            }
            e.updateTask(i), e.refreshData()
          }
        }), t.attachEvent("deleteCallback", function (t, i, n, r) {
          var a = {delete: e.deleteTask, isExist: e.isTaskExists};
          "links" === r && (a.delete = e.deleteLink, a.isExist = e.isLinkExists), a.isExist.call(e, i) && a.delete.call(e, i)
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
    i(4), i(3), i(0), i(92), i(91)
  }, function (t, e, i) {
    i(93)
  }, function (t, e) {
    t.exports = {
      bindDataStore: function (t, e) {
        var i = e.getDatastore(t), n = function (t, e) {
          var n = e.getLayers(), r = i.getItem(t);
          if (r && i.isVisible(t)) for (var a = 0; a < n.length; a++) n[a].render_item(r)
        };

        function r(t) {
          return !!t.$services.getService("state").getState("batchUpdate").batch_update
        }

        i.attachEvent("onStoreUpdated", function (a, s, o) {
          if (!r(e)) {
            var l = e.$services.getService("layers").getDataRender(t);
            l && (a && "move" != o && "delete" != o ? (i.callEvent("onBeforeRefreshItem", [s.id]), n(s.id, l), i.callEvent("onAfterRefreshItem", [s.id])) : (i.callEvent("onBeforeRefreshAll", []), function (t) {
              for (var e = l.getLayers(), n = 0; n < e.length; n++) e[n].clear();
              var r = i.getVisibleItems();
              for (n = 0; n < e.length; n++) e[n].render_items(r)
            }(), i.callEvent("onAfterRefreshAll", [])))
          }
        }), i.attachEvent("onItemOpen", function () {
          e.render()
        }), i.attachEvent("onItemClose", function () {
          e.render()
        }), i.attachEvent("onIdChange", function (a, s) {
          if (i.callEvent("onBeforeIdChange", [a, s]), !r(e)) {
            var o = e.$services.getService("layers").getDataRender(t);
            !function (t, e, i, n) {
              for (var r = 0; r < t.length; r++) t[r].change_id(e, i)
            }(o.getLayers(), a, s, i.getItem(s)), n(s, o)
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
              var a = i[r];
              +a.plannedDate < e && +a.end_date > t && n.push(a)
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
            var a = this.getLink(n[r]);
            a.source == t && (a.source = e), a.target == t && (a.target = e)
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
    var n = i(0), r = i(98), a = i(97), s = i(29), o = i(27), l = i(96), c = i(95);

    function d() {
      for (var t = this.$services.getService("datastores"), e = [], i = 0; i < t.length; i++) e.push(this.getDatastore(t[i]));
      return e
    }

    t.exports = {
      create: function () {
        var t = n.mixin({}, {
          createDatastore: function (t) {
            var e = "treedatastore" == (t.type || "").toLowerCase() ? o : s;
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
            for (var e = d.call(this), i = 0; i < e.length; i++) e[i].refresh();
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
            for (var t = d.call(this), e = 0; e < t.length; e++) t[e].clearAll();
            this._update_flags(), this.userdata = {}, this.callEvent("onClear", []), this.render()
          }, selectTask: function (t) {
            var e = this.$data.tasksStore;
            return !!this.config.select_task && (t && e.select(t), e.getSelectedId())
          }, getSelectedId: function () {
            return this.$data.tasksStore.getSelectedId()
          }
        });
        return n.mixin(t, r()), n.mixin(t, a()), t
      }
    }
  }, function (t, e, i) {
    var n = i(0), r = i(99), a = i(26);
    t.exports = function (t) {
      var e = r.create();
      n.mixin(t, e);
      var s = t.createDatastore({
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
      }), o = t.createDatastore({
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

      function d(e) {
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

      function h() {
        for (var e = null, i = t.$data.tasksStore.getItems(), n = 0, r = i.length; n < r; n++) (e = i[n]).$source = [], e.$target = [];
        var a = t.$data.linksStore.getItems();
        for (n = 0, r = a.length; n < r; n++) c(a[n])
      }

      function u(t) {
        var e = t.source, i = t.target;
        for (var n in t.events) !function (t, n) {
          e.attachEvent(t, function () {
            return i.callEvent(n, Array.prototype.slice.call(arguments))
          }, n)
        }(n, t.events[n])
      }

      s.attachEvent("onBeforeRefreshAll", function () {
        for (var t = s.getVisibleItems(), e = 0; e < t.length; e++) {
          t[e].$index = e
        }
      }), s.attachEvent("onFilterItem", function (e, i) {
        var n = null, r = null;
        return !(t.config.plannedDate && t.config.end_date && (n = t.config.plannedDate.valueOf(), r = t.config.end_date.valueOf(), +i.plannedDate > r || +i.end_date < +n))
      }), s.attachEvent("onIdChange", function (e, i) {
        t._update_flags(e, i)
      }), s.attachEvent("onAfterUpdate", function (e) {
        if (t._update_parents(e), t.getState("batchUpdate").batch_update) return !0;
        for (var i = s.getItem(e), n = 0; n < i.$source.length; n++) o.refresh(i.$source[n]);
        for (n = 0; n < i.$target.length; n++) o.refresh(i.$target[n])
      }), s.attachEvent("onAfterItemMove", function (e, i, n) {
        var r = t.getTask(e);
        null !== this.getNextSibling(e) ? r.$drop_target = this.getNextSibling(e) : null !== this.getPrevSibling(e) ? r.$drop_target = "next:" + this.getPrevSibling(e) : r.$drop_target = "next:null"
      }), s.attachEvent("onStoreUpdated", function (e, i, n) {
        if ("delete" == n && t._update_flags(e, null), !t.$services.getService("state").getState("batchUpdate").batch_update) {
          if (t.config.fit_tasks && "paint" !== n) {
            var r = t.getState();
            a(t);
            var s = t.getState();
            if (+r.min_date != +s.min_date || +r.max_date != +s.max_date) return t.render(), t.callEvent("onScaleAdjusted", []), !0
          }
          "add" == n || "move" == n || "delete" == n ? t.$layout.resize() : e || o.refresh()
        }
      }), o.attachEvent("onAfterAdd", function (t, e) {
        c(e)
      }), o.attachEvent("onAfterUpdate", function (t, e) {
        h()
      }), o.attachEvent("onAfterDelete", function (t, e) {
        d(e)
      }), o.attachEvent("onBeforeIdChange", function (e, i) {
        d(t.mixin({id: e}, t.$data.linksStore.getItem(i))), c(t.$data.linksStore.getItem(i))
      }), o.attachEvent("onFilterItem", function (e, i) {
        if (!t.config.show_links) return !1;
        var n = l(i.source), r = l(i.target);
        return !(!n || !r) && t.callEvent("onBeforeLinkDisplay", [e, i])
      }), function () {
        var e = i(25), n = {};
        t.attachEvent("onBeforeTaskDelete", function (i, r) {
          return n[i] = e.getSubtreeLinks(t, i), !0
        }), t.attachEvent("onAfterTaskDelete", function (e, i) {
          n[e] && t.$data.linksStore.silent(function () {
            for (var i in n[e]) t.$data.linksStore.removeItem(i), d(n[e][i]);
            n[e] = null
          })
        })
      }(), t.attachEvent("onAfterLinkDelete", function (e, i) {
        t.refreshTask(i.source), t.refreshTask(i.target)
      }), t.attachEvent("onParse", h), u({
        source: o,
        target: t,
        events: {
          onItemLoading: "onLinkLoading",
          onBeforeDelete: "onBeforeLinkDelete",
          onAfterDelete: "onAfterLinkDelete",
          onIdChange: "onLinkIdChange"
        }
      }), u({
        source: s,
        target: t,
        events: {
          onItemLoading: "onTaskLoading",
          onBeforeDelete: "onBeforeTaskDelete",
          onAfterDelete: "onAfterTaskDelete",
          onIdChange: "onTaskIdChange",
          onBeforeItemMove: "onBeforeTaskMove",
          onAfterItemMove: "onAfterTaskMove",
          onFilterItem: "onBeforeTaskDisplay",
          onBeforeSelect: "onBeforeTaskSelected",
          onAfterSelect: "onTaskSelected",
          onAfterUnselect: "onTaskUnselected"
        }
      }), t.$data = {tasksStore: s, linksStore: o}
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

      function a(t, e, i, n) {
        var a = t(this);
        return a && a.isVisible() ? a[e].apply(a, i) : n ? n() : r
      }

      return {
        getColumnIndex: function (t) {
          var i = a.call(this, e, "getColumnIndex", [t]);
          return i === r ? 0 : i
        }, dateFromPos: function (e) {
          var i = a.call(this, t, "dateFromPos", Array.prototype.slice.call(arguments));
          return i === r ? this.getState().min_date : i
        }, posFromDate: function (e) {
          var i = a.call(this, t, "posFromDate", [e]);
          return i === r ? 0 : i
        }, getRowTop: function (i) {
          var n = this, s = a.call(n, t, "getRowTop", [i], function () {
            return a.call(n, e, "getRowTop", [i])
          });
          return s === r ? 0 : s
        }, getTaskTop: function (i) {
          var n = this, s = a.call(n, t, "getItemTop", [i], function () {
            return a.call(n, e, "getItemTop", [i])
          });
          return s === r ? 0 : s
        }, getTaskPosition: function (e, i, n) {
          var s = a.call(this, t, "getItemPosition", [e, i, n]);
          return s === r ? {left: 0, top: this.getTaskTop(e.id), height: this.getTaskHeight(), width: 0} : s
        }, getTaskHeight: function () {
          var i = this, n = a.call(i, t, "getItemHeight", [], function () {
            return a.call(i, e, "getItemHeight", [])
          });
          return n === r ? 0 : n
        }, columnIndexByDate: function (e) {
          var i = a.call(this, t, "columnIndexByDate", [e]);
          return i === r ? 0 : i
        }, roundTaskDates: function () {
          a.call(this, t, "roundTaskDates", [])
        }, getScale: function () {
          var e = a.call(this, t, "getScale", []);
          return e === r ? null : e
        }, getTaskNode: function (e) {
          var i = t(this);
          return i && i.isVisible() ? i._taskRenderer.rendered[e] : null
        }, getLinkNode: function (e) {
          var i = t(this);
          return i.isVisible() ? i._linkRenderer.rendered[e] : null
        }, scrollTo: function (t, e) {
          var r = i(this), a = n(this), s = {position: 0}, o = {position: 0};
          r && (o = r.getScrollState()), a && (s = a.getScrollState()), a && 1 * t == t && a.scroll(t), r && 1 * e == e && r.scroll(e);
          var l = {position: 0}, c = {position: 0};
          r && (l = r.getScrollState()), a && (c = a.getScrollState()), this.callEvent("onGanttScroll", [s.position, o.position, c.position, l.position])
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
            var a = r.getScrollState();
            a.visible && (t.x = a.size, t.x_inner = a.scrollSize), t.x_pos = a.position || 0
          }
          if (e) {
            var s = e.getScrollState();
            s.visible && (t.y = s.size, t.y_inner = s.scrollSize), t.y_pos = s.position || 0
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
            var n = e[i], r = !1, a = n.$parent.getPrevSibling(n.$id);
            if (a && a.$config && "grid" === a.$config.id) r = !0; else {
              var s = n.$parent.getNextSibling(n.$id);
              s && s.$config && "grid" === s.$config.id && (r = !0)
            }
            r && (n.$config.css = (n.$config.css ? n.$config.css + " " : "") + "jsgantt-grid-resize-wrap")
          }
        }, onCreated: function (e) {
          var i = !0;
          this._legacyGridResizerClass(e), e.attachEvent("onBeforeResize", function () {
            var r = t.$ui.getView("timeline");
            r && (r.$config.hidden = r.$parent.$config.hidden = !t.config.show_chart);
            var a = t.$ui.getView("grid");
            if (a) {
              var s = t.config.show_grid;
              if (i) {
                var o = a._getColsTotalWidth();
                !1 !== o && (t.config.grid_width = o), s = s && !!t.config.grid_width, t.config.show_grid = s
              }
              if (a.$config.hidden = a.$parent.$config.hidden = !s, !a.$config.hidden) {
                var l = a._getGridWidthLimits();
                if (l[0] && t.config.grid_width < l[0] && (t.config.grid_width = l[0]), l[1] && t.config.grid_width > l[1] && (t.config.grid_width = l[1]), r && t.config.show_chart) if (a.$config.width = t.config.grid_width - 1, i) a.$parent.$config.width = t.config.grid_width, a.$parent.$config.group && t.$layout._syncCellSizes(a.$parent.$config.group, a.$parent.$config.width); else if (r && !n.isChildOf(r.$task, e.$view)) {
                  if (!a.$config.original_grid_width) {
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
                    c && c.config && c.config.grid_width ? a.$config.original_grid_width = c.config.grid_width : a.$config.original_grid_width = 0
                  }
                  t.config.grid_width = a.$config.original_grid_width, a.$parent.$config.width = t.config.grid_width
                } else a.$parent._setContentSize(a.$config.width, a.$config.height), t.$layout._syncCellSizes(a.$parent.$config.group, t.config.grid_width); else r && n.isChildOf(r.$task, e.$view) && (a.$config.original_grid_width = t.config.grid_width), i || (a.$parent.$config.width = 0)
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
          for (var i, n = t.getCellsByType("resizer"), r = !0, a = 0; a < n.length; a++) {
            var s = n[a];
            s._getSiblings();
            var o = s._behind, l = s._front;
            if (o && o.$content === e || o.isChild && o.isChild(e)) {
              i = s, r = !0;
              break
            }
            if (l && l.$content === e || l.isChild && l.isChild(e)) {
              i = s, r = !1;
              break
            }
          }
          return {resizer: i, gridFirst: r}
        }, onInitialized: function (e) {
          var i = t.$ui.getView("grid"), n = this._findGridResizer(e, i);
          if (n.resizer) {
            let ht = 0;
            var r, a = n.gridFirst, s = n.resizer;
            s.attachEvent("onResizeStart", function (e, i) {
              var n = t.$ui.getView("grid"), s = n ? n.$parent : null;
              if (s) {
                var o = n._getGridWidthLimits();
                n.$config.scrollable || (s.$config.minWidth = o[0]), s.$config.maxWidth = o[1]
              }
              return r = a ? e : i, t.callEvent("onPanelResizeStart", [r])
            }), s.attachEvent("onResize", function (e, i) {
              var n = a ? e : i;
              const dom = $('.timeline-cell');
              if (ht == 0) {
                ht = dom.width();
              }
              $('.grid-cell.jsgantt-layout-outer-scroll.jsgantt-layout-cell-border-right').css({'width': n + 'px'});
              $('.scrollHor-cell .jsgantt-hor-scroll').css({'margin-left': n + 'px', 'width': ($('.scrollHor-cell').width() - n) + 'px'});
              dom.css({'width': ht + (-n + r) + 'px'});
              return t.callEvent("onPanelResize", [r, n])
            }), s.attachEvent("onResizeEnd", function (e, i, n, r) {
              var s = a ? e : i, o = a ? n : r, l = t.$ui.getView("grid"), c = l ? l.$parent : null;
              c && (c.$config.minWidth = void 0);
              ht = 0;
              var d = t.callEvent("onPanelResizeEnd", [s, o]);
              return d && (t.config.grid_width = o), d
            })
          }
        }, onDestroyed: function (t) {
        }
      }
    }
  }, function (t, e, i) {
    var n = i(1), r = function (t, e) {
      var i, r, a, s, o;

      function l() {
        return {link_source_id: s, link_target_id: r, link_from_start: o, link_to_start: a, link_landing_area: i}
      }

      var c = e.$services, d = c.getService("state"), h = c.getService("dnd");
      d.registerProvider("linksDnD", l);
      var u = new h(t.$task_bars, {sensitivity: 0, updates_per_second: 60});

      function f(i, n, r, a, s) {
        var o = function (i, n, r) {
          var a = function (t) {
            return e.getTaskPosition(t)
          }(i), s = {x: a.left, y: a.top, width: a.width, height: a.height};
          if (r.rtl ? (s.xEnd = s.x, s.x = s.xEnd + s.width) : s.xEnd = s.x + s.width, s.yEnd = s.y + s.height, e.getTaskType(i.type) == e.config.types.milestone) {
            var o = function () {
              var e = t.getItemHeight();
              return Math.round(Math.sqrt(2 * e * e)) - 2
            }();
            s.x += (r.rtl ? 1 : -1) * (o / 2), s.xEnd += (r.rtl ? -1 : 1) * (o / 2), s.width = a.xEnd - a.x
          }
          return s
        }(i, 0, a), l = {x: o.x, y: o.y};
        n || (l.x = o.xEnd), l.y += e.config.row_height / 2;
        var c = function (t) {
          return e.getTaskType(t.type) == e.config.types.milestone
        }(i) && s ? 2 : 0;
        return r = r || 0, a.rtl && (r *= -1), l.x += (n ? -1 : 1) * r - c, l
      }

      function g(t) {
        var i = l(), n = ["jsgantt-link-tooltip"];
        i.link_source_id && i.link_target_id && (e.isLinkAllowed(i.link_source_id, i.link_target_id, i.link_from_start, i.link_to_start) ? n.push("jsgantt-allowed-link") : n.push("jsgantt-invalid-link"));
        var r = e.templates.drag_link_class(i.link_source_id, i.link_from_start, i.link_target_id, i.link_to_start);
        r && n.push(r);
        var a = "<div class='" + r + "'>" + e.templates.drag_link(i.link_source_id, i.link_from_start, i.link_target_id, i.link_to_start) + "</div>";
        t.innerHTML = a
      }

      function _() {
        s = o = r = null, a = !0
      }

      function p(t, e, i, n) {
        return e >= t ? n <= i ? 1 : 4 : n <= i ? 2 : 3
      }

      u.attachEvent("onBeforeDragStart", e.bind(function (i, r) {
        var a = r.target;
        if (_(), e.getState().drag_id) return !1;
        if (n.locateClassName(a, "jsgantt-link-point")) {
          n.locateClassName(a, "task-start-date") && (o = !0);
          var l = e.locate(r);
          s = l;
          var c = e.getTask(l);
          return e.isReadonly(c) ? (_(), !1) : (this._dir_start = f(c, !!o, 0, t.$getConfig(), !0), !0)
        }
        return !1
      }, this)), u.attachEvent("onAfterDragStart", e.bind(function (t, i) {
        e.config.touch && e.refreshData(), g(u.config.marker)
      }, this)), u.attachEvent("onDragMove", e.bind(function (s, o) {
        var c = u.config, d = u.getPosition(o);
        !function (t, e) {
          t.style.left = e.x + 5 + "px", t.style.top = e.y + 5 + "px"
        }(c.marker, d);
        var h = !!n.locateClassName(o, "jsgantt-link-control"), _ = r, v = i, m = a, $ = e.locate(o), y = !0;
        if (n.isChildOf(o.target, e.$root) || (h = !1, $ = null), h && (y = !n.locateClassName(o, "task-end-date"), h = !!$), r = $, i = h, a = y, h) {
          var k = e.getTask($), w = t.$getConfig(), b = n.locateClassName(o, "jsgantt-link-control"), x = 0;
          b && (x = Math.floor(b.offsetWidth / 2)), this._dir_end = f(k, !!a, x, w)
        } else this._dir_end = n.getRelativeEventPosition(o, t.$task_data);
        var S = !(v == h && _ == $ && m == y);
        return S && (_ && e.refreshTask(_, !1), $ && e.refreshTask($, !1)), S && g(c.marker), function (i, n, r, a) {
          var s = (u._direction || (u._direction = document.createElement("div"), t.$task_links.appendChild(u._direction)), u._direction),
            o = l(), c = ["jsgantt-link-direction"];
          e.templates.link_direction_class && c.push(e.templates.link_direction_class(o.link_source_id, o.link_from_start, o.link_target_id, o.link_to_start));
          var d = Math.sqrt(Math.pow(r - i, 2) + Math.pow(a - n, 2));
          if (d = Math.max(0, d - 3)) {
            s.className = c.join(" ");
            var h = (a - n) / (r - i), f = Math.atan(h);
            2 == p(i, r, n, a) ? f += Math.PI : 3 == p(i, r, n, a) && (f -= Math.PI);
            var g = Math.sin(f), _ = Math.cos(f), v = Math.round(n), m = Math.round(i),
              $ = ["-webkit-transform: rotate(" + f + "rad)", "-moz-transform: rotate(" + f + "rad)", "-ms-transform: rotate(" + f + "rad)", "-o-transform: rotate(" + f + "rad)", "transform: rotate(" + f + "rad)", "width:" + Math.round(d) + "px"];
            if (-1 != window.navigator.userAgent.indexOf("MSIE 8.0")) {
              $.push('-ms-filter: "progid:DXImageTransform.Microsoft.Matrix(M11 = ' + _ + ",M12 = -" + g + ",M21 = " + g + ",M22 = " + _ + ",SizingMethod = 'auto expand')\"");
              var y = Math.abs(Math.round(i - r)), k = Math.abs(Math.round(a - n));
              switch (p(i, r, n, a)) {
                case 1:
                  v -= k;
                  break;
                case 2:
                  m -= y, v -= k;
                  break;
                case 3:
                  m -= y
              }
            }
            $.push("top:" + v + "px"), $.push("left:" + m + "px"), s.style.cssText = $.join(";")
          }
        }(this._dir_start.x, this._dir_start.y, this._dir_end.x, this._dir_end.y), !0
      }, this)), u.attachEvent("onDragEnd", e.bind(function () {
        var t = l();
        if (t.link_source_id && t.link_target_id && t.link_source_id != t.link_target_id) {
          var i = e._get_link_type(t.link_from_start, t.link_to_start),
            n = {source: t.link_source_id, target: t.link_target_id, type: i};
          n.type && e.isLinkAllowed(n) && e.addLink(n)
        }
        _(), e.config.touch ? e.refreshData() : (t.link_source_id && e.refreshTask(t.link_source_id, !1), t.link_target_id && e.refreshTask(t.link_target_id, !1)), u._direction && (u._direction.parentNode && u._direction.parentNode.removeChild(u._direction), u._direction = null)
      }, this))
    };
    t.exports = {
      createLinkDND: function () {
        return {init: r}
      }
    }
  }, function (t, e, i) {
    var n = i(1), r = i(0), a = i(37);
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
                  for (var a in this._events) for (var s in t) this._events[a][s] = n[a];
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
                  var a = t.$getConfig(), s = this._drag_task_coords(i, r);
                  r.left ? (i.plannedDate = e.dateFromPos(s.start + n), i.plannedDate || (i.plannedDate = new Date(e.getState().min_date))) : (i.end_date = e.dateFromPos(s.end + n), i.end_date || (i.end_date = new Date(e.getState().max_date))), i.end_date - i.plannedDate < a.minDuration && (r.left ? i.plannedDate = e.calculateEndDate({
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
                  var r = this._drag_task_coords(e, n), a = t.$getConfig().rtl ? r.start - n.pos.x : n.pos.x - r.start,
                    s = Math.max(0, a);
                  e.progress = Math.min(1, s / Math.abs(r.end - r.start))
                },
                _find_max_shift: function (t, i) {
                  var n;
                  for (var r in t) {
                    var a = t[r], s = e.getTask(a.id), o = this._drag_task_coords(s, a),
                      l = e.posFromDate(new Date(e.getState().min_date)),
                      c = e.posFromDate(new Date(e.getState().max_date));
                    if (o.end + i > c) {
                      var d = c - o.end;
                      (d < n || void 0 === n) && (n = d)
                    } else if (o.start + i < l) {
                      var h = l - o.start;
                      (h < n || void 0 === n) && (n = h)
                    }
                  }
                  return n
                },
                _move: function (t, i, n) {
                  var r = this._drag_task_coords(t, n), a = e.dateFromPos(r.start + i), s = e.dateFromPos(r.end + i);
                  a ? s ? (t.plannedDate = a, t.end_date = s) : (t.end_date = new Date(e.getState().max_date), t.plannedDate = e.dateFromPos(e.posFromDate(t.end_date) - (r.end - r.start))) : (t.plannedDate = new Date(e.getState().min_date), t.end_date = e.dateFromPos(e.posFromDate(t.plannedDate) + (r.end - r.start)))
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
                      s = this.drag.start_drag.start_y;
                    (Date.now() - this.drag.timestamp > 50 || this._is_number(r) && this._is_number(s) && this._mouse_position_change({
                      x: r,
                      y: s
                    }, i) > 20) && this._start_dnd(t)
                  }
                  if (this.drag.mode) {
                    if (!a(this, 40)) return;
                    this._update_on_move(t)
                  }
                },
                _update_item_on_move: function (t, i, n, r, a) {
                  var s = e.getTask(i), o = e.mixin({}, s), l = e.mixin({}, s);
                  this._handlers[n].apply(this, [l, t, r]), e.mixin(s, l, !0), e.callEvent("onTaskDrag", [s.id, n, l, o, a]), e.mixin(s, l, !0), e.refreshTask(i)
                },
                _update_on_move: function (i) {
                  var a = this.drag, s = t.$getConfig();
                  if (a.mode) {
                    var o = n.getRelativeEventPosition(i, t.$task_data);
                    if (a.pos && a.pos.x == o.x) return;
                    a.pos = o;
                    var l = e.dateFromPos(o.x);
                    if (!l || isNaN(l.getTime())) return;
                    var c = o.x - a.start_x, d = e.getTask(a.id);
                    if (this._handlers[a.mode]) {
                      if (e.isSummaryTask(d) && a.mode == s.drag_mode.move) {
                        var h = {};
                        h[a.id] = r.copy(a);
                        var u = this._find_max_shift(r.mixin(h, this.dragMultiple), c);
                        for (var f in void 0 !== u && (c = u), this._update_item_on_move(c, a.id, a.mode, a, i), this.dragMultiple) {
                          var g = this.dragMultiple[f];
                          this._update_item_on_move(c, g.id, g.mode, g, i)
                        }
                      } else this._update_item_on_move(c, a.id, a.mode, a, i);
                      e._update_parents(a.id)
                    }
                  }
                },
                on_mouse_down: function (i, r) {
                  if (2 != i.button || void 0 === i.button) {
                    var a = t.$getConfig(), s = e.locate(i), o = null;
                    if (e.isTaskExists(s) && (o = e.getTask(s)), !e.isReadonly(o) && !this.drag.mode) {
                      this.clear_drag_state(), r = r || i.target;
                      var l = n.getClassName(r), c = this._get_drag_mode(l, r);
                      if (!l || !c) return r.parentNode ? this.on_mouse_down(i, r.parentNode) : void 0;
                      if (c) if (c.mode && c.mode != a.drag_mode.ignore && a["drag_" + c.mode]) {
                        if (s = e.locate(r), o = e.copy(e.getTask(s) || {}), e.isReadonly(o)) return this.clear_drag_state(), !1;
                        if (e.isSummaryTask(o) && c.mode != a.drag_mode.progress) return void this.clear_drag_state();
                        c.id = s;
                        var d = n.getRelativeEventPosition(i, e.$task_data);
                        c.start_x = d.x, c.start_y = d.y, c.obj = o, this.drag.start_drag = c, this.drag.timestamp = Date.now()
                      } else this.clear_drag_state(); else if (e.checkEvent("onMouseDown") && e.callEvent("onMouseDown", [l.split(" ")[0]]) && r.parentNode) return this.on_mouse_down(i, r.parentNode)
                    }
                  }
                },
                _fix_dnd_scale_time: function (i, n) {
                  var r = t.$getConfig(), a = e.getScale().unit, s = e.getScale().step;

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

                  r.round_dnd_dates || (a = "minute", s = r.time_step), n.mode == r.drag_mode.resize ? n.left ? (i.plannedDate = e.roundDate({
                    date: i.plannedDate,
                    unit: a,
                    step: s
                  }), o(i)) : (i.end_date = e.roundDate({date: i.end_date, unit: a, step: s}), function (i) {
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
                    unit: a,
                    step: s
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
                  var a = e.getTask(t);
                  if (i.work_time && i.correct_work_time && this._fix_working_times(a, n), this._fix_dnd_scale_time(a, n), this._fireEvent("before_finish", n.mode, [t, n.mode, e.copy(n.obj), r])) {
                    var s = t;
                    e._init_task_timing(a), this.clear_drag_state(), e.updateTask(a.id), this._fireEvent("after_finish", n.mode, [s, n.mode, r])
                  } else this.clear_drag_state(), t == n.id && (n.obj._joc_changed = !1, e.mixin(a, n.obj, !0)), e.refreshTask(a.id)
                },
                on_mouse_up: function (i) {
                  var n = this.drag;
                  if (n.mode && n.id) {
                    var r = t.$getConfig(), a = e.getTask(n.id), s = this.dragMultiple;
                    if (e.isSummaryTask(a) && n.mode == r.drag_mode.move) for (var o in s) this._finalize_mouse_up(s[o].id, r, s[o], i);
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
                      var a = i.getAttribute("data-bind-property");
                      r.left = "plannedDate" == a;
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
                  var r = t.$getConfig(), a = n.id;
                  if (r["drag_" + n.mode] && e.callEvent("onBeforeDrag", [a, n.mode, i]) && this._fireEvent("before_start", n.mode, [a, n.mode, i])) {
                    delete n.start_drag;
                    var s = e.getTask(a);
                    e.isSummaryTask(s) && n.mode == r.drag_mode.move && e.eachTask(function (t) {
                      this.dragMultiple[t.id] = e.mixin({id: t.id, obj: t}, this.drag)
                    }, s.id, this), e.callEvent("onTaskDragStart", [])
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
    var n = i(0), r = i(105), a = i(104), s = i(1);
    t.exports = function (t) {
      var e = t.$services;
      return {
        onCreated: function (e) {
          var s = e.$config;
          s.bind = n.defined(s.bind) ? s.bind : "task", s.bindLinks = n.defined(s.bindLinks) ? s.bindLinks : "link", e._linksDnD = a.createLinkDND(), e._tasksDnD = r.createTaskDND(), e._tasksDnD.extend(e), this._mouseDelegates = i(15)(t)
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
            var n = s.getRelativeEventPosition(e, t.$task_data), r = t.dateFromPos(n.x),
              a = Math.floor(t.columnIndexByDate(r)), o = t.getScale().trace_x[a];
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
        var a = function (t, e) {
          var i = n.getNodePosition(e.$grid_data), r = n.getRelativeEventPosition(t, e.$grid_data),
            a = e.$config.rowStore, s = i.x, o = r.y - 10, l = e.$getConfig();
          o < i.y && (o = i.y);
          var c = a.countVisible() * l.row_height;
          return o > i.y + c - l.row_height && (o = i.y + c - l.row_height), i.x = s, i.y = o, i
        }(t, i);
        e.marker.style.left = a.x + 9 + "px", e.marker.style.top = a.y + "px";
        var s = e.markerLine;
        s || ((s = document.createElement("div")).className = "jsgantt-drag-marker jsgantt-grid-dnd-marker", s.innerHTML = "<div class='jsgantt-grid-dnd-marker-line'></div>", s.style.pointerEvents = "none", document.body.appendChild(s), e.markerLine = s), t.child ? function (t, e, i) {
          var n = t.targetParent, a = r({x: 0, y: i.getItemTop(n)}, i);
          e.innerHTML = "<div class='jsgantt-grid-dnd-marker-folder'></div>", e.style.width = i.$grid_data.offsetWidth + "px", e.style.top = a.y + "px", e.style.left = a.x + "px", e.style.height = i.getItemHeight(n) + "px"
        }(t, s, i) : function (t, e, i) {
          var n = function (t, e) {
            var i = e.$config.rowStore, n = {x: 0, y: 0}, a = e.$grid_data.querySelector(".jsgantt-tree-indent"),
              s = 15, o = 0;
            if (a && (s = a.offsetWidth), t.targetId !== i.$getRootId()) {
              var l = e.getItemTop(t.targetId), c = e.getItemHeight(t.targetId);
              if (o = i.exists(t.targetId) ? i.calculateItemLevel(i.getItem(t.targetId)) : 0, t.prevSibling) n.y = l; else if (t.nextSibling) {
                var d = 0;
                i.eachItem(function (t) {
                  -1 !== i.getIndexById(t.id) && d++
                }, t.targetId), n.y = l + c + d * c
              } else n.y = l + c, o += 1
            }
            return n.x = 40 + o * s, n.width = Math.max(e.$grid_data.offsetWidth - n.x, 0), r(n, e)
          }(t, i);
          e.innerHTML = "<div class='jsgantt-grid-dnd-marker-line'></div>", e.style.left = n.x + "px", e.style.height = "4px", e.style.top = n.y - 2 + "px", e.style.width = n.width + "px"
        }(t, s, i)
      }
    }
  }, function (t, e, i) {
    var n = i(13);
    t.exports = function (t, e, i, r, a) {
      var s;
      if (e !== a.$getRootId()) s = i < .25 ? n.prevSiblingTarget(t, e, a) : !(i > .6) || a.hasChild(e) && a.getItem(e).$open ? n.firstChildTarget(t, e, a) : n.nextSiblingTarget(t, e, a); else {
        var o = a.$getRootId();
        s = a.hasChild(o) && r >= 0 ? n.lastChildTarget(t, o, a) : n.firstChildTarget(t, o, a)
      }
      return s
    }
  }, function (t, e, i) {
    var n = i(13);

    function r(t, e, i, r, a) {
      for (var s = e; r.exists(s);) {
        var o = r.calculateItemLevel(r.getItem(s));
        if ((o === i || o === i - 1) && r.getBranchIndex(s) > -1) break;
        s = a ? r.getPrev(s) : r.getNext(s)
      }
      return r.exists(s) ? r.calculateItemLevel(r.getItem(s)) === i ? a ? n.nextSiblingTarget(t, s, r) : n.prevSiblingTarget(t, s, r) : n.firstChildTarget(t, s, r) : null
    }

    function a(t, e, i, n) {
      return r(t, e, i, n, !0)
    }

    function s(t, e, i, n) {
      return r(t, e, i, n, !1)
    }

    t.exports = function (t, e, i, r, o, l) {
      var c;
      if (e !== o.$getRootId()) i < .5 ? o.calculateItemLevel(o.getItem(e)) === l ? c = o.getPrevSibling(e) ? n.nextSiblingTarget(t, o.getPrevSibling(e), o) : n.prevSiblingTarget(t, e, o) : (c = a(t, e, l, o)) && (c = s(t, e, l, o)) : o.calculateItemLevel(o.getItem(e)) === l ? c = n.nextSiblingTarget(t, e, o) : (c = s(t, e, l, o)) && (c = a(t, e, l, o)); else {
        var d = o.$getRootId(), h = o.getChildren(d);
        c = n.createDropTargetObject(), c = h.length && r >= 0 ? a(t, function (t) {
          for (var e = t.getNext(); t.exists(e);) {
            var i = t.getNext(e);
            if (!t.exists(i)) return e;
            e = i
          }
          return null
        }(o), l, o) : s(t, d, l, o)
      }
      return c
    }
  }, function (t, e, i) {
    var n = i(1), r = i(13), a = i(109), s = i(108), o = i(107);
    t.exports = {
      init: function (t, e) {
        var i = t.$services.getService("dnd");
        if (e.$config.bind && t.getDatastore(e.$config.bind)) {
          var l = new i(e.$grid_data, {updates_per_second: 60});
          t.defined(e.$getConfig().dnd_sensitivity) && (l.config.sensitivity = e.$getConfig().dnd_sensitivity), l.attachEvent("onBeforeDragStart", t.bind(function (i, r) {
            var a = c(r);
            if (!a) return !1;
            if (t.hideQuickInfo && t._hideQuickInfo(), n.closest(r.target, ".jsgantt-grid-editor-placeholder")) return !1;
            var s = a.getAttribute(e.$config.item_attribute), o = e.$config.rowStore.getItem(s);
            return !t.isReadonly(o) && (l.config.initial_open_state = o.$open, !!t.callEvent("onRowDragStart", [s, r.target, r]) && void 0)
          }, t)), l.attachEvent("onAfterDragStart", t.bind(function (t, i) {
            var n = c(i);
            l.config.marker.innerHTML = n.outerHTML;
            var a = l.config.marker.firstChild;
            a && (l.config.marker.style.opacity = .4, a.style.position = "static", a.style.pointerEvents = "none"), l.config.id = n.getAttribute(e.$config.item_attribute);
            var s = e.$config.rowStore, o = s.getItem(l.config.id);
            l.config.level = s.calculateItemLevel(o), l.config.drop_target = r.createDropTargetObject({
              targetParent: s.getParent(o.id),
              targetIndex: s.getBranchIndex(o.id),
              targetId: o.id,
              nextSibling: !0
            }), o.$open = !1, o.$transparent = !0, this.refreshData()
          }, t)), l.attachEvent("onDragMove", t.bind(function (i, n) {
            var a = d(n);
            return a && !1 !== t.callEvent("onBeforeRowDragMove", [l.config.id, a.targetParent, a.targetIndex]) || (a = r.createDropTargetObject(l.config.drop_target)), o.highlightPosition(a, l.config, e), l.config.drop_target = a, this.callEvent("onRowDragMove", [l.config.id, a.targetParent, a.targetIndex]), !0
          }, t)), l.attachEvent("onDragEnd", t.bind(function () {
            var t = e.$config.rowStore, i = t.getItem(l.config.id);
            o.removeLineHighlight(l.config), i.$transparent = !1, i.$open = l.config.initial_open_state;
            var n = l.config.drop_target;
            !1 === this.callEvent("onBeforeRowDragEnd", [l.config.id, n.targetParent, n.targetIndex]) ? i.$drop_target = null : (t.move(l.config.id, n.targetIndex, n.targetParent), this.callEvent("onRowDragEnd", [l.config.id, n.targetParent, n.targetIndex])), t.refresh(i.id)
          }, t))
        }

        function c(t) {
          return n.locateAttribute(t, e.$config.item_attribute)
        }

        function d(t) {
          var i = function (t) {
              var i = n.getRelativeEventPosition(t, e.$grid_data).y, r = e.$config.rowStore;
              if ((i = i || 0) < 0) return r.$getRootId();
              var a = Math.floor(i / e.getItemHeight());
              return a > r.countVisible() - 1 ? r.$getRootId() : r.getIdByIndex(a)
            }(t), r = null, o = e.$config.rowStore, c = !e.$getConfig().order_branch_free,
            d = n.getRelativeEventPosition(t, e.$grid_data).y;
          return i !== o.$getRootId() && (r = (d - e.getItemTop(i)) / e.getItemHeight()), c ? a(l.config.id, i, r, d, o, l.config.level) : s(l.config.id, i, r, d, o)
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
          t.defined(e.$getConfig().dnd_sensitivity) && (r.config.sensitivity = e.$getConfig().dnd_sensitivity), r.attachEvent("onBeforeDragStart", t.bind(function (i, o) {
            var l = a(o);
            if (!l) return !1;
            if (t.hideQuickInfo && t._hideQuickInfo(), n.closest(o.target, ".jsgantt-grid-editor-placeholder")) return !1;
            var c = l.getAttribute(e.$config.item_attribute), d = s().getItem(c);
            return !t.isReadonly(d) && (r.config.initial_open_state = d.$open, !!t.callEvent("onRowDragStart", [c, o.target, o]) && void 0)
          }, t)), r.attachEvent("onAfterDragStart", t.bind(function (t, i) {
            var n = a(i);
            r.config.marker.innerHTML = n.outerHTML;
            var o = r.config.marker.firstChild;
            o && (o.style.position = "static"), r.config.id = n.getAttribute(e.$config.item_attribute);
            var l = s(), c = l.getItem(r.config.id);
            r.config.index = l.getBranchIndex(r.config.id), r.config.parent = c.parent, c.$open = !1, c.$transparent = !0, this.refreshData()
          }, t)), r.lastTaskOfLevel = function (t) {
            for (var e = null, i = s().getItems(), n = 0, r = i.length; n < r; n++) i[n].$level == t && (e = i[n]);
            return e ? e.id : null
          }, r._getGridPos = t.bind(function (t) {
            var i = n.getNodePosition(e.$grid_data), r = s(), a = i.x, o = t.pos.y - 10, l = e.$getConfig();
            o < i.y && (o = i.y);
            var c = r.countVisible() * l.row_height;
            return o > i.y + c - l.row_height && (o = i.y + c - l.row_height), i.x = a, i.y = o, i
          }, t), r._getTargetY = t.bind(function (t) {
            var i = n.getNodePosition(e.$grid_data), r = t.pageY - i.y + (e.$state.scrollTop || 0);
            return r < 0 && (r = 0), r
          }, t), r._getTaskByY = t.bind(function (t, i) {
            var n = e.$getConfig(), r = s();
            t = t || 0;
            var a = Math.floor(t / n.row_height);
            return (a = i < a ? a - 1 : a) > r.countVisible() - 1 ? null : r.getIdByIndex(a)
          }, t), r.attachEvent("onDragMove", t.bind(function (t, i) {
            var n = r.config, a = r._getGridPos(i), o = e.$getConfig(), l = s();
            n.marker.style.left = a.x + 10 + "px", n.marker.style.top = a.y + "px";
            var c = l.getItem(r.config.id), d = r._getTargetY(i), h = r._getTaskByY(d, l.getIndexById(c.id));

            function u(t, e) {
              return !l.isChildOf(f.id, e.id) && (t.$level == e.$level || o.order_branch_free)
            }

            if (l.exists(h) || (h = r.lastTaskOfLevel(o.order_branch_free ? c.$level : 0)) == r.config.id && (h = null), l.exists(h)) {
              var f = l.getItem(h);
              if (l.getIndexById(f.id) * o.row_height + o.row_height / 2 < d) {
                var g = l.getIndexById(f.id), _ = l.getNext(f.id), p = l.getItem(_);
                if (p) {
                  if (p.id == c.id) return o.order_branch_free && l.isChildOf(c.id, f.id) && 1 == l.getChildren(f.id).length ? void l.move(c.id, l.getBranchIndex(f.id) + 1, l.getParent(f.id)) : void 0;
                  f = p
                } else if (_ = l.getIdByIndex(g), u(p = l.getItem(_), c) && p.id != c.id) return void l.move(c.id, -1, l.getParent(p.id))
              } else if (o.order_branch_free && f.id != c.id && u(f, c)) {
                if (!l.hasChild(f.id)) return f.$open = !0, void l.move(c.id, -1, f.id);
                if (l.getIndexById(f.id) || o.row_height / 3 < d) return
              }
              g = l.getIndexById(f.id);
              for (var v = l.getIdByIndex(g - 1), m = l.getItem(v), $ = 1; (!m || m.id == f.id) && g - $ >= 0;) v = l.getIdByIndex(g - $), m = l.getItem(v), $++;
              if (c.id == f.id) return;
              u(f, c) && c.id != f.id ? l.move(c.id, 0, 0, f.id) : f.$level != c.$level - 1 || l.getChildren(f.id).length ? m && u(m, c) && c.id != m.id && l.move(c.id, -1, l.getParent(m.id)) : l.move(c.id, 0, f.id)
            }
            return !0
          }, t)), r.attachEvent("onDragEnd", t.bind(function () {
            var t = s(), e = t.getItem(r.config.id);
            e.$transparent = !1, e.$open = r.config.initial_open_state, !1 === this.callEvent("onBeforeRowDragEnd", [r.config.id, r.config.parent, r.config.index]) ? (t.move(r.config.id, r.config.index, r.config.parent), e.$drop_target = null) : this.callEvent("onRowDragEnd", [r.config.id, e.$drop_target]), this.refreshData()
          }, t))
        }

        function a(t) {
          return n.locateAttribute(t, e.$config.item_attribute)
        }

        function s() {
          return t.getDatastore(e.$config.bind)
        }
      }
    }
  }, function (t, e, i) {
    var n = i(0), r = i(111), a = i(110);
    t.exports = function (t) {
      return {
        onCreated: function (e) {
          e.$config = n.mixin(e.$config, {bind: "task"}), "grid" == e.$config.id && this.extendGantt(e), this._mouseDelegates = i(15)(t)
        }, onInitialized: function (e) {
          var i = e.$getConfig();
          i.order_branch && ("marker" == i.order_branch ? a.init(e.$jsgantt, e) : r.init(e.$jsgantt, e)), this.initEvents(e, t), "grid" == e.$config.id && this.extendDom(e)
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
              }).removeClass("arrow-down reverse").addClass("dropdown-ac")
            } else {
              var a = t.$getConfig();
              if (null !== n) {
                var s = this.getTask(n);
                a.scroll_on_click && !e._is_icon_open_click(i) && this.showDate(s.plannedDate), e.callEvent("onTaskRowClick", [n, r])
              }
            }
          }, e), t.$grid), this._mouseDelegates.delegate("click", "jsgantt-grid-head-cell", e.bind(function (i, n, r) {
            var a = r.getAttribute("data-column-id");
            if (e.callEvent("onPanelHeaderClick", [a, i])) {
              var s = t.$getConfig();
              if ("add" != a && s.sort) {
                for (var o, l = a, c = 0; c < s.columns.length; c++) if (s.columns[c].name == a) {
                  o = s.columns[c];
                  break
                }
                if (o && void 0 !== o.sort && !0 !== o.sort && !(l = o.sort)) return;
                var d = this._sort && this._sort.direction && this._sort.name == a ? this._sort.direction : "desc";
                d = "desc" == d ? "asc" : "desc", this._sort = {name: a, direction: d}, this.sort(l, "desc" == d)
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
        var r = i.getGridColumns(), a = i.$getConfig(), s = i.$getTemplates(), o = i.$config.rowStore;
        a.rtl && (r = r.reverse());
        for (var l = [], c = 0; c < r.length; c++) {
          var d, h, u, f = c == r.length - 1, g = r[c];
          h = g.template ? g.template(e) : e[g.name], n.isDate(h) && (h = s.date_grid(h, e)), u = h, h = "<div class='jsgantt-tree-content'>" + h + "</div>";
          var _ = "jsgantt-cell" + (f ? " jsgantt-last-cell" : ""), p = [];
          if (g.tree) {
            for (var v = 0; v < e.$level; v++) p.push(s.grid_indent(e));
            o.hasChild(e.id) && !t.isSplitTask(e) ? (p.push(s.grid_open(e)), p.push(s.grid_folder(e))) : (p.push(s.grid_blank(e)), p.push(s.grid_file(e)))
          }
          var m = "width:" + (g.width - (f ? 1 : 0)) + "px;padding-right:16px";
          f && (m = "width:auto;padding-right:16px"), this.defined(g.align) && (m += "text-align:" + g.align + ";");
          var $ = t._waiAria.gridCellAttrString(g, u);
          if (0 == c && !e.isWorkflow) {
            let i = e.id;
            let str = '<div class="btn-group dropdown m-r-sm" style="vertical-align: top"><button type="button" class="btn-drop dropdown-timeline more-option-h" data-toggle="dropdown"><i class="fa fa-ellipsis-h"></i></button> <div class="dropdown-menu dropdown-ac dropdown-more list-dropdown" role="menu">';
            if(e.open) {
              str = str +  '<a id="' + i + 'removeBtn" class="dropdown-item bg-hover-color">' + t.config.btnRemoveOrder + '</a></div></div>';
            }else {
             str = str +  '<a id="' + i + 'editBtn" class="dropdown-item">' + t.config.btnChangeParameter + '</a><a id="' + i + 'removeBtn" class="dropdown-item bg-hover-color">' + t.config.btnRemoveOrder + '</a></div></div>';
            }
            p.push(str);
          }
          p.push(h), a.rtl && (p = p.reverse()), d = "<div class='" + _ + "' data-column-index='" + c + "' data-column-name='" + g.name + "' style='" + m + "' " + $ + ">" + p.join("") + "</div>", l.push(d)
        }
        if (_ = t.getGlobalTaskIndex(e.id) % 2 == 0 ? "" : " odd", _ += e.$transparent ? " jsgantt-transparent" : "", _ += e.$dataprocessor_class ? " " + e.$dataprocessor_class : "", s.grid_row_class) {
          var y = s.grid_row_class.call(t, e.plannedDate, e.end_date, e);
          y && (_ += " " + y)
        }
        o.getSelectedId() == e.id && (_ += " jsgantt-selected");
        var k = document.createElement("div");
        k.className = "jsgantt-row" + _ + " jsgantt-row-" + t.getTaskType(e.type);
        var w = i.getItemHeight();
        return k.style.height = w + "px", k.style.lineHeight = w + "px", a.smart_rendering && (k.style.position = "absolute", k.style.left = "0px", k.style.top = i.getItemTop(e.id) + "px"), i.$config.item_attribute && k.setAttribute(i.$config.item_attribute, e.id), t._waiAria.taskRowAttr(e, k), k.innerHTML = l.join(""), k
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
          var i, n = e.$getConfig(), r = n.link_wrapper_width, a = t.y + (n.row_height - r) / 2;
          switch (t.direction) {
            case this.dirs.left:
              i = {top: a, height: r, lineHeight: r, left: t.x - t.size - r / 2, width: t.size + r};
              break;
            case this.dirs.right:
              i = {top: a, lineHeight: r, height: r, left: t.x - r / 2, width: t.size + r};
              break;
            case this.dirs.up:
              i = {top: a - t.size, lineHeight: t.size + r, height: t.size + r, left: t.x - r / 2, width: r};
              break;
            case this.dirs.down:
              i = {top: a, lineHeight: t.size + r, height: t.size + r, left: t.x - r / 2, width: r}
          }
          return i
        }, get_line_sizes: function (t, e) {
          var i, n = e.$getConfig(), r = n.link_line_width, a = n.link_wrapper_width, s = t.size + r;
          switch (t.direction) {
            case this.dirs.left:
            case this.dirs.right:
              i = {height: r, width: s, marginTop: (a - r) / 2, marginLeft: (a - r) / 2};
              break;
            case this.dirs.up:
            case this.dirs.down:
              i = {height: s, width: r, marginTop: (a - r) / 2, marginLeft: (a - r) / 2}
          }
          return i
        }, render_line: function (t, e, i) {
          var n = this.get_wrapper_sizes(t, i), r = document.createElement("div");
          r.style.cssText = ["top:" + n.top + "px", "left:" + n.left + "px", "height:" + n.height + "px", "width:" + n.width + "px"].join(";"), r.className = "jsgantt-line-wrapper";
          var a = this.get_line_sizes(t, i), s = document.createElement("div");
          return s.style.cssText = ["height:" + a.height + "px", "width:" + a.width + "px", "margin-top:" + a.marginTop + "px", "margin-left:" + a.marginLeft + "px"].join(";"), s.className = "jsgantt-link-line-" + t.direction, r.appendChild(s), r
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
          var a = e.dirs;
          switch (i) {
            case a.left:
              r.x -= n;
              break;
            case a.right:
              r.x += n;
              break;
            case a.up:
              r.y -= n;
              break;
            case a.down:
              r.y += n
          }
          return this.point(r)
        }, get_points: function (i, n) {
          var r = this.get_endpoint(i, n), a = t.config, s = r.e_y - r.y, o = r.e_x - r.x, l = e.dirs;
          this.clear(), this.point({x: r.x, y: r.y});
          var c = 2 * a.link_arrow_size, d = this.get_line_type(i, n.$getConfig()), h = r.e_x > r.x;
          if (d.from_start && d.to_start) this.point_to(l.left, c), h ? (this.point_to(l.down, s), this.point_to(l.right, o)) : (this.point_to(l.right, o), this.point_to(l.down, s)), this.point_to(l.right, c); else if (!d.from_start && d.to_start) if (h = r.e_x > r.x + 2 * c, this.point_to(l.right, c), h) o -= c, this.point_to(l.down, s), this.point_to(l.right, o); else {
            o -= 2 * c;
            var u = s > 0 ? 1 : -1;
            this.point_to(l.down, u * (a.row_height / 2)), this.point_to(l.right, o), this.point_to(l.down, u * (Math.abs(s) - a.row_height / 2)), this.point_to(l.right, c)
          } else d.from_start || d.to_start ? d.from_start && !d.to_start && (h = r.e_x > r.x - 2 * c, this.point_to(l.left, c), h ? (o += 2 * c, u = s > 0 ? 1 : -1, this.point_to(l.down, u * (a.row_height / 2)), this.point_to(l.right, o), this.point_to(l.down, u * (Math.abs(s) - a.row_height / 2)), this.point_to(l.left, c)) : (o += c, this.point_to(l.down, s), this.point_to(l.right, o))) : (this.point_to(l.right, c), h ? (this.point_to(l.right, o), this.point_to(l.down, s)) : (this.point_to(l.down, s), this.point_to(l.right, o)), this.point_to(l.left, c));
          return this.path
        }, get_line_type: function (e, i) {
          var n = i.links, r = !1, a = !1;
          return e.type == n.start_to_start ? r = a = !0 : e.type == n.finish_to_finish ? r = a = !1 : e.type == n.finish_to_start ? (r = !1, a = !0) : e.type == n.start_to_finish ? (r = !0, a = !1) : t.assert(!1, "Invalid link type"), i.rtl && (r = !r, a = !a), {
            from_start: r,
            to_start: a
          }
        }, get_endpoint: function (e, i) {
          var r = i.$getConfig(), a = this.get_line_type(e, r), s = a.from_start, o = a.to_start,
            l = t.getTask(e.source), c = t.getTask(e.target), d = n(l, i), h = n(c, i);
          return {x: s ? d.left : d.left + d.width, e_x: o ? h.left : h.left + h.width, y: d.top, e_y: h.top}
        }
      };

      function n(e, i) {
        var n = i.$getConfig(), r = i.getItemPosition(e);
        if (t.getTaskType(e.type) == n.types.milestone) {
          var a = t.getTaskHeight(), s = Math.sqrt(2 * a * a);
          r.left -= s / 2, r.width = s
        }
        return r
      }

      return function (n, r) {
        var a = r.$getConfig(), s = i.get_endpoint(n, r), o = s.e_y - s.y;
        if (!(s.e_x - s.x || o)) return null;
        var l = i.get_points(n, r), c = e.get_lines(l, r), d = document.createElement("div"), h = "jsgantt-task-link";
        n.color && (h += " jsgantt-link-inline-color");
        var u = t.templates.link_class ? t.templates.link_class(n) : "";
        u && (h += " " + u), a.highlight_critical_path && t.isCriticalLink && t.isCriticalLink(n) && (h += " jsgantt-critical-link"), d.className = h, r.$config.link_attribute && d.setAttribute(r.$config.link_attribute, n.id);
        for (var f = 0; f < c.length; f++) {
          f == c.length - 1 && (c[f].size -= a.link_arrow_size);
          var g = e.render_line(c[f], c[f + 1], r);
          n.color && (g.firstChild.style.backgroundColor = n.color), d.appendChild(g)
        }
        var _ = c[c.length - 1].direction, p = function (t, i, n) {
          var r = n.$getConfig(), a = document.createElement("div"), s = t.y, o = t.x, l = r.link_arrow_size,
            c = r.row_height, d = "jsgantt-link-arrow jsgantt-link-arrow-" + i;
          switch (i) {
            case e.dirs.right:
              s -= (l - c) / 2, o -= l;
              break;
            case e.dirs.left:
              s -= (l - c) / 2;
              break;
            case e.dirs.up:
              o -= l;
              break;
            case e.dirs.down:
              s += 2 * l, o -= l
          }
          return a.style.cssText = ["top:" + s + "px", "left:" + o + "px"].join(";"), a.className = d, a
        }(l[l.length - 1], _, r);
        return n.color && (p.style.borderColor = n.color), d.appendChild(p), t._waiAria.linkAttr(n, d), d
      }
    }
  }, function (t, e) {
    t.exports = function (t) {
      return function (e, i) {
        var n = i.$getConfig(), r = i.$getTemplates(), a = i.getScale(), s = a.count, o = document.createElement("div");
        if (n.show_task_cells) for (var l = 0; l < s; l++) {
          var c = a.width[l], d = "";
          if (c > 0) {
            var h = document.createElement("div");
            h.style.width = c + "px", d = "jsgantt-task-cell" + (l == s - 1 ? " jsgantt-last-cell" : ""), (f = r.task_cell_class(e, a.trace_x[l])) && (d += " " + f), h.className = d, o.appendChild(h)
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
          for (var r = document.createElement("div"), a = t.getTaskPosition(i), s = t.getChildren(i.id), o = 0; o < s.length; o++) {
            var l = t.getTask(s[o]), c = e(l, n);
            if (c) {
              var d = Math.floor((t.config.row_height - a.height) / 2);
              c.style.top = a.top + d + "px", c.className += " jsgantt-split-child", r.appendChild(c)
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
      i(0);

      function n() {
        return e.apply(this, arguments) || this
      }

      return i(2)(n, e), n
    }
  }, function (t, e, i) {
    t.exports = function (t) {
      var e = i(7)(t);
      i(0);

      function n() {
        return e.apply(this, arguments) || this
      }

      return i(2)(n, e), n
    }
  }, function (t, e, i) {
    t.exports = function (t) {
      var e = i(7)(t);
      i(0);

      function n() {
        return e.apply(this, arguments) || this
      }

      return i(2)(n, e), n
    }
  }, function (t, e) {
    t.exports = {}
  }, function (t, e) {
    t.exports = {}
  }, function (t, e, i) {
    t.exports = function (t) {
    }
  }, function (t, e, i) {
    var n = i(124), r = i(0), a = (i(1), i(4));
    t.exports = function (t) {
      var e = n(t), i = {};
      a(i);
      var s = {};
      return r.mixin(s, e), r.mixin(s, i), s
    }
  }, function (t, e, i) {
    var n = i(0), r = i(31), a = i(14), s = i(2), o = function (t) {
      function e(e, i, n, r) {
        var a = t.apply(this, arguments) || this;
        return a.$config.bindLinks = null, a
      }

      return s(e, t), n.mixin(e.prototype, {
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
      }, !0), n.mixin(e.prototype, a(t), !0), e
    }(r);
    t.exports = o
  }, function (t, e, i) {
    var n = i(1), r = i(0), a = i(14), s = i(16), o = i(2), l = function (t) {
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
            var a = n.locateAttribute(t, this.$config.item_attribute);
            return a && r.select(a.getAttribute(this.$config.item_attribute)), !1
          }, this), this.$grid)
        }
      }, !0), r.mixin(e.prototype, a(e), !0), e
    }(s);
    t.exports = l
  }, function (t, e, i) {
    var n = i(1);
    t.exports = function (t, e) {
      var i = {
        column_before_start: t.bind(function (t, i, r) {
          var a = e.$getConfig();
          if (!n.locateAttribute(r, a.grid_resizer_column_attribute)) return !1;
          var s = this.locate(r, a.grid_resizer_column_attribute), o = e.getGridColumns()[s];
          return !1 !== e.callEvent("onColumnResizeStart", [s, o]) && void 0
        }, t), column_after_start: t.bind(function (t, i, n) {
          var r = e.$getConfig(), a = this.locate(n, r.grid_resizer_column_attribute);
          t.config.marker.innerHTML = "", t.config.marker.className += " jsgantt-grid-resize-area", t.config.marker.style.height = e.$grid.offsetHeight + "px", t.config.marker.style.top = "0px", t.config.drag_index = a
        }, t), column_drag_move: t.bind(function (i, r, a) {
          var s = e.$getConfig(), o = i.config, l = e.getGridColumns(), c = parseInt(o.drag_index, 10), d = l[c],
            h = n.getNodePosition(e.$grid_scale), u = parseInt(o.marker.style.left, 10),
            f = d.min_width ? d.min_width : s.min_grid_column_width, g = e.$grid_data.offsetWidth, _ = 0, p = 0;
          s.rtl ? u = h.x + h.width - 1 - u : u -= h.x - 1;
          for (var v = 0; v < c; v++) f += l[v].width, _ += l[v].width;
          if (u < f && (u = f), s.keep_grid_width) {
            var m = 0;
            for (v = c + 1; v < l.length; v++) l[v].min_width ? g -= l[v].min_width : s.min_grid_column_width && (g -= s.min_grid_column_width), l[v].max_width && !1 !== m ? m += l[v].max_width : m = !1;
            m && (f = e.$grid_data.offsetWidth - m), u < f && (u = f), u > g && (u = g)
          } else if (!e.$config.scrollable) {
            var $ = u, y = 0;
            for (v = c + 1; v < l.length; v++) y += l[v].width;
            $ + y > t.$container.offsetWidth && (u = t.$container.offsetWidth - y)
          }
          return o.left = u - 1, p = Math.abs(u - _), d.max_width && p > d.max_width && (p = d.max_width), s.rtl && (_ = h.width - _ + 2 - p), o.marker.style.top = h.y + "px", o.marker.style.left = h.x - 1 + _ + "px", o.marker.style.width = p + "px", e.callEvent("onColumnResize", [c, l[c], p - 1]), !0
        }, t), column_drag_end: t.bind(function (i, n, r) {
          for (var a = e.$getConfig(), s = e.getGridColumns(), o = 0, l = parseInt(i.config.drag_index, 10), c = s[l], d = 0; d < l; d++) o += s[d].width;
          var h = c.min_width && i.config.left - o < c.min_width ? c.min_width : i.config.left - o;
          if (c.max_width && c.max_width < h && (h = c.max_width), !1 !== e.callEvent("onColumnResizeEnd", [l, c, h]) && c.width != h) {
            if (c.width = h, a.keep_grid_width) o = a.grid_width; else {
              d = l;
              for (var u = s.length; d < u; d++) o += s[d].width
            }
            e.callEvent("onColumnResizeComplete", [s, e._setColumnsWidth(o, l)]), e.$config.scrollable || t.$layout._syncCellSizes(e.$config.group, a.grid_width), this.render()
          }
        }, t)
      };
      return {
        init: function () {
          var n = t.$services.getService("dnd"), r = e.$getConfig(), a = new n(e.$grid_scale, {updates_per_second: 60});
          t.defined(r.dnd_sensitivity) && (a.config.sensitivity = r.dnd_sensitivity), a.attachEvent("onBeforeDragStart", function (t, e) {
            return i.column_before_start(a, t, e)
          }), a.attachEvent("onAfterDragStart", function (t, e) {
            return i.column_after_start(a, t, e)
          }), a.attachEvent("onDragMove", function (t, e) {
            return i.column_drag_move(a, t, e)
          }), a.attachEvent("onDragEnd", function (t, e) {
            return i.column_drag_end(a, t, e)
          })
        }, doOnRender: function () {
          for (var i = e.getGridColumns(), n = e.$getConfig(), r = 0, a = e.$config.width, s = n.scale_height, o = 0; o < i.length; o++) {
            var l, c = i[o];
            if (r += c.width, l = n.rtl ? a - r : r, c.resize) {
              var d = document.createElement("div");
              d.className = "jsgantt-grid-column-resize-wrap", d.style.top = "0px", d.style.height = s + "px", d.innerHTML = "<div class='jsgantt-grid-column-resize'></div>", d.setAttribute(n.grid_resizer_column_attribute, o), t._waiAria.gridSeparatorAttr(d), e.$grid_scale.appendChild(d), d.style.left = Math.max(0, l) + "px"
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

          function a(t) {
            return i[t] || null
          }

          function s(t, e, i) {
            return (t + "" + e + i.bottomBorderColor + i.rightBorderColor).replace(/[^\w\d]/g, "")
          }

          function o(t, e) {
            i[t] = e
          }

          function l(t, e, i) {
            var n = Math.floor(500 / t) || 1, a = Math.floor(500 / e) || 1, s = document.createElement("canvas");
            s.height = e * a, s.width = t * n;
            var o = s.getContext("2d");
            return function (t, e, i, n, a, s) {
              var o = a.createImageData(e * n, t * i);
              o.imageSmoothingEnabled = !1;
              for (var c = 1 * s.rightBorderWidth, d = r(s.rightBorderColor), h = 0, u = 0, f = 0, g = 1; g <= n; g++) for (h = g * e - 1, f = 0; f < c; f++) for (u = 0; u < t * i; u++) l(h - f, u, d, o);
              var _ = 1 * s.bottomBorderWidth, p = r(s.bottomBorderColor);
              u = 0;
              for (var v = 1; v <= i; v++) for (u = v * t - 1, f = 0; f < _; f++) for (h = 0; h < e * n; h++) l(h, u - f, p, o);
              a.putImageData(o, 0, 0)
            }(e, t, a, n, o, i), s.toDataURL();

            function l(e, i, r, a) {
              var s = 4 * (i * (t * n) + e);
              a.data[s] = r.r, a.data[s + 1] = r.g, a.data[s + 2] = r.b, a.data[s + 3] = r.a
            }
          }

          function c(t) {
            return "jsgantt-static-bg-" + t
          }

          return {
            render: function (t, i, r, d) {
              if (i.static_background && document.createElement("canvas").getContext) {
                t.innerHTML = "";
                var h = function (t, i, n, r) {
                  var a, s, o = [], l = 0, c = n.width.filter(function (t) {
                    return !!t
                  }), d = 0, h = 1e5;
                  if (e.isIE) {
                    var u = navigator.appVersion || "";
                    -1 == u.indexOf("Windows NT 6.2") && -1 == u.indexOf("Windows NT 6.1") && -1 == u.indexOf("Windows NT 6.0") || (h = 2e4)
                  }
                  for (var f = 0; f < c.length; f++) {
                    var g = c[f];
                    if (g != s && void 0 !== s || f == c.length - 1 || l > h) {
                      for (var _ = r, p = 0, v = Math.floor(h / i.row_height) * i.row_height, m = l; _ > 0;) {
                        var $ = Math.min(_, v);
                        _ -= v, (a = document.createElement("div")).style.height = $ + "px", a.style.position = "absolute", a.style.top = p + "px", a.style.left = d + "px", a.style.whiteSpace = "no-wrap", a.className = t[s || g], f == c.length - 1 && (m = g + m - 1), a.style.width = m + "px", o.push(a), p += $
                      }
                      l = 0, d += m
                    }
                    g && (l += g, s = g)
                  }
                  return o
                }(function (t, e, i) {
                  var r = {}, d = function (t) {
                    for (var e = t.width, i = {}, n = 0; n < e.length; n++) 1 * e[n] && (i[e[n]] = !0);
                    return i
                  }(i), h = e.row_height, u = "";
                  for (var f in d) {
                    var g = 1 * f, _ = s(g, h, t);
                    if (!a(_)) {
                      var p = l(g, h, t);
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
                  var n = getComputedStyle(i), r = getComputedStyle(e), a = {
                    bottomBorderWidth: n.getPropertyValue("border-bottom-width").replace("px", ""),
                    rightBorderWidth: r.getPropertyValue("border-right-width").replace("px", ""),
                    bottomBorderColor: n.getPropertyValue("border-bottom-color"),
                    rightBorderColor: r.getPropertyValue("border-right-color")
                  };
                  return t.removeChild(i), a
                }(t), i, r), i, r, d), u = document.createDocumentFragment();
                h.forEach(function (t) {
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
          var a = n - i + 1;
          if (!(i > r.length - 1 || a <= 0 || n > r.length - 1)) {
            var s = t - this.getSum(r, i, n);
            this.adjustSize(s, r, i, n), this.adjustSize(-s, r, n + 1), e.full_width = this.getSum(r)
          }
        }, splitSize: function (t, e) {
          for (var i = [], n = 0; n < e; n++) i[n] = 0;
          return this.adjustSize(t, i), i
        }, adjustSize: function (t, e, i, n) {
          i || (i = 0), void 0 === n && (n = e.length - 1);
          for (var r = n - i + 1, a = this.getSum(e, i, n), s = i; s <= n; s++) {
            var o = Math.floor(t * (a ? e[s] / a : 1 / r));
            a -= e[s], t -= o, r--, e[s] += o
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
        }, prepareConfigs: function (t, e, i, n, r, a, s) {
          for (var o = this.splitSize(n, t.length), l = i, c = [], d = t.length - 1; d >= 0; d--) {
            var h = d == t.length - 1, u = this.initScaleConfig(t[d], r, a);
            h && this.processIgnores(u), this.initColSizes(u, e, l, o[d]), this.limitVisibleRange(u), h && (l = u.full_width), c.unshift(u)
          }
          for (d = 0; d < c.length - 1; d++) this.alineScaleColumns(c[c.length - 1], c[d]);
          for (d = 0; d < c.length; d++) s && this.reverseScale(c[d]), this.setPosSettings(c[d]);
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
            for (var r = !0, a = t, s = 0; s < n.step; s++) s && (a = e.add(t, s, n.unit)), r = r && !this.isWorkTime(a, n.unit);
            return r
          }
          return !1
        }, processIgnores: function (t) {
          t.ignore_x = {}, t.display_count = t.count
        }, initColSizes: function (t, i, n, r) {
          var a = n;
          t.height = r;
          var s = void 0 === t.display_count ? t.count : t.display_count;
          s || (s = 1), t.col_width = Math.floor(a / s), i && t.col_width < i && (t.col_width = i, a = t.col_width * s), t.width = [];
          for (var o = t.ignore_x || {}, l = 0; l < t.trace_x.length; l++) if (o[t.trace_x[l].valueOf()] || t.display_count == t.count) t.width[l] = 0; else {
            var c = 1;
            "month" == t.unit && (c = Math.round((e.add(t.trace_x[l], t.step, t.unit) - t.trace_x[l]) / 864e5)), t.width[l] = c
          }
          this.adjustSize(a - this.getSum(t.width), t.width), t.full_width = this.getSum(t.width)
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
          for (var a = e.trace_x, s = t.trace_x, o = i || 0, l = n || s.length - 1, c = 0, d = 1; d < a.length; d++) {
            var h = t.trace_indexes[+a[d]];
            void 0 !== h && h <= l && (r && r.apply(this, [c, d, o, h]), o = h, c = d)
          }
        }, alineScaleColumns: function (t, e, i, n) {
          this.iterateScales(t, e, i, n, function (i, n, r, a) {
            var s = this.getSum(t.width, r, a - 1);
            this.getSum(e.width, i, n - 1) != s && this.setSumWidth(s, e, i, n - 1)
          })
        }, eachColumn: function (i, n, r, a, s) {
          var o = new Date(r), l = new Date(a);
          e[i + "_start"] && (o = e[i + "_start"](o));
          var c = new Date(o);
          for (+c >= +l && (l = e.add(c, n, i)); +c < +l;) {
            s.call(this, new Date(c));
            var d = c.getTimezoneOffset();
            c = e.add(c, n, i), c = t._correct_dst_change(c, d, n, i), e[i + "_start"] && (c = e[i + "_start"](c))
          }
        }, limitVisibleRange: function (t) {
          var i = t.trace_x, n = t.width.length - 1, r = 0;
          if (+i[0] < +t.min_date && 0 != n) {
            var a = Math.floor(t.width[0] * ((i[1] - t.min_date) / (i[1] - i[0])));
            r += t.width[0] - a, t.width[0] = a, i[0] = new Date(t.min_date)
          }
          var s = i.length - 1, o = i[s], l = e.add(o, t.step, t.unit);
          if (+l > +t.max_date && s > 0 && (a = t.width[s] - Math.floor(t.width[s] * ((l - t.max_date) / (l - o))), r += t.width[s] - a, t.width[s] = a), r) {
            for (var c = this.getSum(t.width), d = 0, h = 0; h < t.width.length; h++) {
              var u = Math.floor(r * (t.width[h] / c));
              t.width[h] += u, d += u
            }
            this.adjustSize(r - d, t.width)
          }
        }
      }
    }
  }, function (t, e, i) {
    var n = i(2), r = i(1), a = i(0), s = i(8), o = function (t) {
      "use strict";

      function e(e, i, n, r) {
        var s = t.apply(this, arguments) || this;
        this.$config = a.mixin(i, {scroll: "x"}), s._scrollHorizontalHandler = a.bind(s._scrollHorizontalHandler, s), s._scrollVerticalHandler = a.bind(s._scrollVerticalHandler, s), s._outerScrollVerticalHandler = a.bind(s._outerScrollVerticalHandler, s), s._outerScrollHorizontalHandler = a.bind(s._outerScrollHorizontalHandler, s), s._mouseWheelHandler = a.bind(s._mouseWheelHandler, s), this.$config.hidden = !0;
        var o = r.config.scroll_size;
        return r.env.isIE && (o += 1), this._isHorizontal() ? (s.$config.height = o, s.$parent.$config.height = o) : (s.$config.width = o, s.$parent.$config.width = o), this.$config.scrollPosition = 0, s.$name = "scroller", s
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
        for (var t = this._getLinkedViews(), e = this._isVertical() ? "jsgantt-right-panel jsgantt-layout-outer-scroll jsgantt-layout-outer-scroll-vertical" : "jsgantt-layout-outer-scroll jsgantt-layout-outer-scroll-horizontal", i = 0; i < t.length; i++) r.addClassName(t[i].$view || t[i].getNode(), e)
      }, e.prototype._initVertical = function () {
        this.$scroll_ver = this.$view, this.$domEvents.attach(this.$view, "scroll", this._scrollVerticalHandler)
      }, e.prototype._updateLinkedViews = function () {
      }, e.prototype._initMouseWheel = function () {
        s.isFF ? this.$domEvents.attach(this._getRootParent().$view, "wheel", this._mouseWheelHandler) : this.$domEvents.attach(this._getRootParent().$view, "mousewheel", this._mouseWheelHandler)
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
        for (var t, e = 0, i = 0, n = this._isHorizontal(), r = this._getLinkedViews(), a = n ? "scrollWidth" : "scrollHeight", s = n ? "contentX" : "contentY", o = n ? "x" : "y", l = this._getScrollOffset(), c = 0; c < r.length; c++) if ((t = r[c]) && t.$content && t.$content.getSize && !t.$config.hidden) {
          var d, h = t.$content.getSize();
          if (d = h.hasOwnProperty(a) ? h[a] : h[s], l) h[s] > h[o] && h[s] > e && d > h[o] - l + 2 && (e = d + (n ? 0 : 2), i = h[o]); else {
            var u = Math.max(h[s] - d, 0);
            (d += u) > Math.max(h[o] - u, 0) && d > e && (e = d, i = h[o])
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
          var r = i[n].$parent.$cells, a = r[r.length - 1];
          if (a && "scrollbar" == a.$config.view && !1 === a.$config.hidden) {
            t = a.$config.width;
            break
          }
        }
        return t || 0
      }, e.prototype._setScrollSize = function (t) {
        var e = this._isHorizontal() ? "width" : "height",
          i = this._isHorizontal() ? this.$scroll_hor : this.$scroll_ver, n = this._getScrollOffset(), a = i.firstChild;
        n ? this._isVertical() ? (this.$config.outerSize = this.$config.height - n + 3, i.style.height = this.$config.outerSize + "px", i.style.top = n - 1 + "px", r.addClassName(i, this.$parent._borders.top), r.addClassName(i.parentNode, "jsgantt-task-vscroll")) : (this.$config.outerSize = this.$config.width - n + 1, i.style.width = this.$config.outerSize + "px") : (i.style.top = "auto", r.removeClassName(i, this.$parent._borders.top), r.removeClassName(i.parentNode, "jsgantt-task-vscroll"), this.$config.outerSize = this.$config.height), a.style[e] = t + "px"
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
          var i = {}, n = s.isFF, r = n ? -20 * t.deltaX : 2 * t.wheelDeltaX, a = n ? -40 * t.deltaY : t.wheelDelta;
          if (!t.shiftKey || t.deltaX || t.wheelDeltaX || (r = 2 * a, a = 0), r && Math.abs(r) > Math.abs(a)) {
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
            o = a / -40, void 0 === a && (o = t.detail);
            var d = this._oldTop, h = this.$scroll_ver.scrollTop + 30 * o;
            if (this.scrollVertically(h), this.$scroll_ver.scrollTop = h, d == this.$scroll_ver.scrollTop) return !0;
            this._oldTop = this.$scroll_ver.scrollTop
          }
          return t.preventDefault && t.preventDefault(), t.cancelBubble = !0, !1
        }
      }, e
    }(i(6));
    t.exports = o
  }, function (t, e, i) {
    var n = i(2), r = i(1), a = i(0), s = i(6), o = function (t) {
      "use strict";

      function e(e, i, n) {
        var r, a, s = t.apply(this, arguments) || this;
        return s._moveHandler = function (t) {
          s._moveResizer(s._resizer, t.pageX, t.pageY)
        }, s._upHandler = function () {
          var t = s._getNewSizes();
          !1 !== s.callEvent("onResizeEnd", [r, a, t ? t.back : 0, t ? t.front : 0]) && s._setSizes(), s._setBackground(!1), s._clearResizer(), s._clearListeneres()
        }, s._clearListeneres = function () {
          this.$domEvents.detach(document, "mouseup", s._upHandler), this.$domEvents.detach(document, "mousemove", s._moveHandler), this.$domEvents.detach(document, "mousemove", s._startOnMove), this.$domEvents.detach(document, "mouseup", s._cancelDND)
        }, s._callStartDNDEvent = function () {
          if (this._xMode ? (r = this._behind.$config.width || this._behind.$view.offsetWidth, a = this._front.$config.width || this._front.$view.offsetWidth) : (r = this._behind.$config.height || this._behind.$view.offsetHeight, a = this._front.$config.height || this._front.$view.offsetHeight), !1 === s.callEvent("onResizeStart", [r, a])) return !1
        }, s._startDND = function (t) {
          if (!1 !== this._callStartDNDEvent()) {
            var e = !1;
            this._eachGroupItem(function (t) {
              t._getSiblings(), !1 === t._callStartDNDEvent() && (e = !0)
            }), e || (s._moveHandler(t), s.$domEvents.attach(document, "mousemove", s._moveHandler), s.$domEvents.attach(document, "mouseup", s._upHandler))
          }
        }, s._cancelDND = function () {
          s._setBackground(!1), s._clearResizer(), s._clearListeneres()
        }, s._startOnMove = function (t) {
          s._isPosChanged(t) && (s._clearListeneres(), s._startDND(t))
        }, s._downHandler = function (t) {
          s._getSiblings(), s._behind.$config.collapsed || s._front.$config.collapsed || (s._setBackground(!0), s._resizer = s._setResizer(), s._positions = {
            x: t.pageX,
            y: t.pageY,
            timestamp: Date.now()
          }, s.$domEvents.attach(document, "mousemove", s._startOnMove), s.$domEvents.attach(document, "mouseup", s._cancelDND))
        }, s.$name = "resizer", s
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
        this.$config.prev && (this._behind = this.$factory.getView(this.$config.prev), this._behind instanceof s || (this._behind = this._behind.$parent)), this.$config.next && (this._front = this.$factory.getView(this.$config.next), this._front instanceof s || (this._front = this._behind.$parent));
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
        var i, n, r, a, s;
        this._xMode ? (i = t - this._positions.x, n = this._behind.$config.width || this._behind.$view.offsetWidth, a = this._front.$config.width || this._front.$view.offsetWidth, r = this._behind.$config.minWidth, s = this._front.$config.minWidth) : (i = e - this._positions.y, n = this._behind.$config.height || this._behind.$view.offsetHeight, a = this._front.$config.height || this._front.$view.offsetHeight, r = this._front.$config.minHeight, s = this._front.$config.minHeight);
        var o, l, c = this._getDirection(t, e);
        if (-1 === c) {
          if (l = a - i, o = n - Math.abs(i), a - i > this._front.$config.maxWidth) return;
          Math.abs(i) >= n && (i = -Math.abs(n - 2)), n - Math.abs(i) <= r && (i = -Math.abs(n - r))
        } else l = a - Math.abs(i), o = n + i, n + i > this._behind.$config.maxWidth && (i = this._behind.$config.maxWidth - n), Math.abs(i) >= a && (i = a - 2), a - Math.abs(i) <= s && (i = Math.abs(a - s));
        return -1 === c ? (l = a - i, o = n - Math.abs(i)) : (l = a - Math.abs(i), o = n + i), {
          size: i,
          newFrontSide: l,
          newBehindSide: o
        }
      }, e.prototype._getGroupName = function () {
        return this._getSiblings(), this._front.$config.group || this._behind.$config.group
      }, e.prototype._eachGroupItem = function (t, e) {
        for (var i = this.$factory.getView("main"), n = this._getGroupName(), r = i.getCellsByType("resizer"), a = 0; a < r.length; a++) r[a]._getGroupName() == n && r[a] != this && t.call(e || this, r[a])
      }, e.prototype._getGroupResizePosition = function (t, e) {
        var i = this._getResizePosition(t, e);
        if (!this._getGroupName()) return i;
        var n, r = [i];
        this._eachGroupItem(function (i) {
          i._getSiblings();
          var n = a.copy(this._positions);
          this._xMode ? n.x += i._behind.$config.width - this._behind.$config.width : n.y += i._behind.$config.height - this._behind.$config.height, i._positions = n, r.push(i._getResizePosition(t, e))
        });
        for (var s = 0; s < r.length; s++) {
          if (!r[s]) return;
          void 0 === n ? n = r[s] : r[s].newBehindSide > n.newBehindSide && (n = r[s])
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
          r = this._behind.$view[e], a = (n - i) / n * this._front.getSize().gravity,
          s = (r + i) / r * this._behind.getSize().gravity;
        "front" !== t && (this._front.$config.gravity = a), "behind" !== t && (this._behind.$config.gravity = s)
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
    }(s);
    t.exports = o
  }, function (t, e, i) {
    var n = i(2), r = i(0), a = function (t) {
      "use strict";

      function e(e, i, n) {
        var a = t.apply(this, arguments) || this;
        if (i.view) {
          i.id && (this.$id = r.uid());
          var s = r.copy(i);
          if (delete s.config, delete s.templates, this.$content = this.$factory.createView(i.view, this, s, this), !this.$content) return !1
        }
        return a.$name = "viewCell", a
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
    t.exports = a
  }, function (t, e, i) {
    var n = i(2), r = i(35), a = i(6), s = function (t) {
      "use strict";

      function e(e, i, n) {
        for (var r = t.apply(this, arguments) || this, a = 0; a < r.$cells.length; a++) r.$cells[a].$config.hidden = 0 !== a;
        return r.$cell = r.$cells[0], r.$name = "viewLayout", r
      }

      return n(e, t), e.prototype.cell = function (e) {
        var i = t.prototype.cell.call(this, e);
        return i.$view || this.$fill(null, this), i
      }, e.prototype.moveView = function (t) {
        var e = this.$view;
        this.$cell && (this.$cell.$config.hidden = !0, e.removeChild(this.$cell.$view)), this.$cell = t, e.appendChild(t.$view)
      }, e.prototype.setSize = function (t, e) {
        a.prototype.setSize.call(this, t, e)
      }, e.prototype.setContentSize = function () {
        var t = this.$lastSize;
        this.$cell.setSize(t.contentX, t.contentY)
      }, e.prototype.getSize = function () {
        var e = t.prototype.getSize.call(this);
        if (this.$cell) {
          var i = this.$cell.getSize();
          if (this.$config.byMaxSize) for (var n = 0; n < this.$cells.length; n++) {
            var r = this.$cells[n].getSize();
            for (var a in i) i[a] = Math.max(i[a], r[a])
          }
          for (var s in e) e[s] = e[s] || i[s];
          e.gravity = Math.max(e.gravity, i.gravity)
        }
        return e
      }, e
    }(r);
    t.exports = s
  }, function (t, e) {
    t.exports = function (t) {
      var e = t.$services, i = {}, n = {};

      function r(r, a, s) {
        if (n[r]) return n[r];
        a.renderer || t.assert(!1, "Invalid renderer call");
        var o = a.filter;
        return s && s.setAttribute(e.config().layer_attribute, !0), n[r] = {
          render_item: function (e, i) {
            if (i = i || s, !o || o(e)) {
              var n = function (t) {
                return a.renderer.call(this, t, a.host)
              }.call(t, e);
              this.append(e, n, i)
            } else this.remove_item(e.id)
          }, clear: function (t) {
            this.rendered = i[r] = {}, a.append || this.clear_container(t)
          }, clear_container: function (t) {
            (t = t || s) && (t.innerHTML = "")
          }, render_items: function (t, e) {
            e = e || s;
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
            e ? e.parentNode || this.append(t, e, s) : this.render_item(t, s)
          }, change_id: function (t, e) {
            this.rendered[e] = this.rendered[t], delete this.rendered[t]
          }, rendered: i[r], node: s, destructor: function () {
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
    var n = i(135), r = i(0), a = i(1);

    function s(t) {
      return t instanceof Array || (t = Array.prototype.slice.call(arguments, 0)), function (e) {
        for (var i = !0, n = 0, r = t.length; n < r; n++) {
          var a = t[n];
          a && (i = i && !1 !== a(e.id, e))
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
              for (var i = this.container(), s = this.tempCollection, o = 0; o < s.length; o++) if (t = s[o], this.container() || t && t.container && a.isChildOf(t.container, document.body)) {
                var l = t.container, c = t.id, d = t.topmost;
                if (!l.parentNode) if (d) i.appendChild(l); else {
                  var h = n ? n() : i.firstChild;
                  h ? i.insertBefore(l, h) : i.appendChild(l)
                }
                this.renderers[c] = e.getRenderer(c, t, l), this.tempCollection.splice(o, 1), o--
              }
            }, addLayer: function (t) {
              return t && ("function" == typeof t && (t = {renderer: t}), void 0 === t.filter ? t.filter = s(o || []) : t.filter instanceof Array && (t.filter.push(o), t.filter = s(t.filter)), t.container || (t.container = document.createElement("div"))), this._add(t), t ? t.id : void 0
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
          var n = i.name, r = i.defaultContainer, a = i.defaultContainerSibling,
            s = e.createGroup(r, a, function (t, e) {
              if (!s.filters) return !0;
              for (var i = 0; i < s.filters.length; i++) if (!1 === s.filters[i](t, e)) return !1
            });
          return t.$services.setService("layer:" + n, function () {
            return s
          }), t.attachEvent("onGanttReady", function () {
            s.addLayer()
          }), s
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
        var i = {click: {}};

        function n(t, e, n, r) {
          i[t][e] || (i[t][e] = []), i[t][e].push({handler: n, root: r})
        }

        function r(t) {
          t = t || window.event;
          var n = e.locate(t), r = s(t, i.click), a = !0;
          if (null !== n ? a = !e.checkEvent("onTaskClick") || e.callEvent("onTaskClick", [n, t]) : e.callEvent("onEmptyClick", [t]), a) {
            if (!function (t, i, n) {
              for (var r = !0, a = 0; a < t.length; a++) {
                var s = t[a].call(e, i, n, i.target);
                r = r && !(void 0 !== s && !0 !== s)
              }
              return r
            }(r, t, n)) return;
            n && e.getTask(n)
          }
        }

        function a(t) {
        }

        function s(e, i) {
          for (var n = e.target, r = []; n;) {
            var a = t.getClassName(n);
            if (a) {
              a = a.split(" ");
              for (var s = 0; s < a.length; s++) if (a[s] && i[a[s]]) for (var o = i[a[s]], l = 0; l < o.length; l++) o[l].root && !t.isChildOf(n, o[l].root) || r.push(o[l].handler)
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

        function d(t) {
          c.detachAll(), t && (c.attach(t, "click", r), c.attach(t, "dblclick", o), c.attach(t, "mousemove", l), c.attach(t, "contextmenu", a))
        }

        return {
          reset: d, global: function (t, e, i) {
            n(t, e, i, null)
          }, delegate: n, detach: function (t, e, n, r) {
            if (i[t] && i[t][e]) {
              for (var a = i[t], s = a[e], o = 0; o < s.length; o++) s[o].root == r && (s.splice(o, 1), o--);
              s.length || delete a[e]
            }
          }, callHandler: function (t, e, n, r) {
            var a = i[t][e];
            if (a) for (var s = 0; s < a.length; s++) (n || a[s].root) && a[s].root !== n || a[s].handler.apply(this, r)
          }, onMouseMove: l, onClick: r, destructor: function () {
            d(), i = null, c = null
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

    function a(t, e) {
      var i = this.$config[t];
      return i ? i instanceof r ? i : (r.prototype = e, this.$config[t] = new r(i), this.$config[t]) : e
    }

    t.exports = function (t, e) {
      n.mixin(t, function (t) {
        var e, i;
        return {
          $getConfig: function () {
            return e || (e = t ? t.$getConfig() : this.$jsgantt.config), a.call(this, "config", e)
          }, $getTemplates: function () {
            return i || (i = t ? t.$getTemplates() : this.$jsgantt.templates), a.call(this, "templates", i)
          }
        }
      }(e))
    }
  }, function (t, e, i) {
    var n = i(0), r = i(139);
    t.exports = {
      createFactory: function (t) {
        var e = {}, i = {};

        function a(a, s, o, l) {
          var c = e[a];
          if (!c || !c.create) return !1;
          "resizer" != a || o.mode || (l.$config.cols ? o.mode = "x" : o.mode = "y"), "viewcell" != a || "scrollbar" != o.view || o.scroll || (l.$config.cols ? o.scroll = "y" : o.scroll = "x"), (o = n.copy(o)).id || i[o.view] || (o.id = o.view), o.id && !o.css && (o.css = o.id + "-cell");
          var d = new c.create(s, o, this, t);
          return c.configure && c.configure(d), r(d, l), d.$id || (d.$id = o.id || t.uid()), d.$parent || "object" != typeof s || (d.$parent = s), d.$config || (d.$config = o), i[d.$id] && (d.$id = t.uid()), i[d.$id] = d, d
        }

        return {
          initUI: function (t, e) {
            var i = "cell";
            return t.view ? i = "viewcell" : t.resizer ? i = "resizer" : t.rows || t.cols ? i = "layout" : t.views && (i = "multiview"), a.call(this, i, null, t, e)
          }, reset: function () {
            i = {}
          }, registerView: function (t, i, n) {
            e[t] = {create: i, configure: n}
          }, createView: a, getView: function (t) {
            return i[t]
          }
        }
      }
    }
  }, function (t, e, i) {
    var n = i(140), r = i(138), a = i(137), s = i(6), o = i(35), l = i(134), c = i(133), d = i(132), h = i(131),
      u = i(34), f = i(16), g = i(127), _ = i(31), p = i(126), v = i(125), m = i(30), $ = i(116), y = i(115),
      k = i(114), w = i(113), b = i(112), x = i(106), S = i(103);
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
        i.registerView("cell", s), i.registerView("resizer", d), i.registerView("scrollbar", h), i.registerView("layout", o, function (t) {
          "main" === (t.$config ? t.$config.id : null) && e(t, S)
        }), i.registerView("viewcell", c), i.registerView("multiview", l), i.registerView("timeline", u, function (t) {
          "timeline" !== (t.$config ? t.$config.id : null) && "task" != t.$config.bind || e(t, x)
        }), i.registerView("grid", f, function (t) {
          "grid" !== (t.$config ? t.$config.id : null) && "task" != t.$config.bind || e(t, b)
        }), i.registerView("resourceGrid", g), i.registerView("resourceTimeline", _), i.registerView("resourceHistogram", p);
        var T = a(t), D = v(t);
        return t.ext.inlineEditors = D, t.ext._inlineEditors = D, {
          factory: i,
          mouseEvents: r.init(t),
          layersApi: T.init(),
          render: {gridLine: w(t), taskBg: y(t), taskBar: m(t), taskSplitBar: $(t), link: k(t)},
          layersService: {
            getDataRender: function (e) {
              return T.getDataRender(e, t)
            }, createDataRender: function (e) {
              return T.createDataRender(e, t)
            }
          }
        }
      }
    }
  }, function (t, e, i) {
    i(0), i(1);
    t.exports = function (t) {
    }
  }, function (t, e, i) {
    (function (t, e) {
      !function (t, i) {
        "use strict";
        if (!t.setImmediate) {
          var n, r = 1, a = {}, s = !1, o = t.document, l = Object.getPrototypeOf && Object.getPrototypeOf(t);
          l = l && l.setTimeout ? l : t, "[object process]" === {}.toString.call(t.process) ? n = function (t) {
            e.nextTick(function () {
              d(t)
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
              i.source === t && "string" == typeof i.data && 0 === i.data.indexOf(e) && d(+i.data.slice(e.length))
            };
            t.addEventListener ? t.addEventListener("message", i, !1) : t.attachEvent("onmessage", i), n = function (i) {
              t.postMessage(e + i, "*")
            }
          }() : t.MessageChannel ? function () {
            var t = new MessageChannel;
            t.port1.onmessage = function (t) {
              d(t.data)
            }, n = function (e) {
              t.port2.postMessage(e)
            }
          }() : o && "onreadystatechange" in o.createElement("script") ? function () {
            var t = o.documentElement;
            n = function (e) {
              var i = o.createElement("script");
              i.onreadystatechange = function () {
                d(e), i.onreadystatechange = null, t.removeChild(i), i = null
              }, t.appendChild(i)
            }
          }() : n = function (t) {
            setTimeout(d, 0, t)
          }, l.setImmediate = function (t) {
            "function" != typeof t && (t = new Function("" + t));
            for (var e = new Array(arguments.length - 1), i = 0; i < e.length; i++) e[i] = arguments[i + 1];
            var s = {callback: t, args: e};
            return a[r] = s, n(r), r++
          }, l.clearImmediate = c
        }

        function c(t) {
          delete a[t]
        }

        function d(t) {
          if (s) setTimeout(d, 0, t); else {
            var e = a[t];
            if (e) {
              s = !0;
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
                c(t), s = !1
              }
            }
          }
        }
      }("undefined" == typeof self ? void 0 === t ? this : t : self)
    }).call(this, i(17), i(36))
  }, function (t, e, i) {
    (function (t) {
      var n = void 0 !== t && t || "undefined" != typeof self && self || window, r = Function.prototype.apply;

      function a(t, e) {
        this._id = t, this._clearFn = e
      }

      e.setTimeout = function () {
        return new a(r.call(setTimeout, n, arguments), clearTimeout)
      }, e.setInterval = function () {
        return new a(r.call(setInterval, n, arguments), clearInterval)
      }, e.clearTimeout = e.clearInterval = function (t) {
        t && t.close()
      }, a.prototype.unref = a.prototype.ref = function () {
      }, a.prototype.close = function () {
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
        var a = t.config, s = t.templates;
        t.config[i] && e[r] != a[i] && (n && s[r] || (s[r] = t.date.date_to_str(a[i]), e[r] = a[i]))
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
            link_class: function (t) {
              return ""
            },
            link_description: function (e) {
              var i = t.getTask(e.source), n = t.getTask(e.target);
              return "<b>" + i.orderId + "</b> &ndash;  <b>" + n.orderId + "</b>"
            },
            drag_link: function (e, i, n, r) {
              e = t.getTask(e);
              var a = t.locale.labels, s = "<b>" + e.orderId + "</b> " + (i ? a.link_start : a.link_end) + "<br/>";
              return n && (s += "<b> " + (n = t.getTask(n)).orderId + "</b> " + (r ? a.link_start : a.link_end) + "<br/>"), s
            },
            drag_link_class: function (e, i, n, r) {
              var a = "";
              return e && n && (a = " " + (t.isLinkAllowed(e, n, i, r) ? "jsgantt-link-allow" : "jsgantt-link-deny")), "jsgantt-link-tooltip" + a
            },
            tooltip_date_format: e.date_to_str("%Y-%m-%d"),
            tooltip_text: function (e, i, n) {
              return "<b>Task:</b> " + n.orderId + "<br/><b>Start date:</b> " + t.templates.tooltip_date_format(e) + "<br/><b>End date:</b> " + t.templates.tooltip_date_format(i)
            }
          })
        }, initTemplate: i
      }
    }
  }, function (t, e, i) {
    var n = i(4), r = i(0), a = i(37);
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

      function i(i, a) {
        this._obj = i, this._settings = a || {}, n(this);
        var s = this.getInputMethods();
        this._drag_start_timer = null, t.attachEvent("onGanttScroll", r.bind(function (t, e) {
          this.clearDragTimer()
        }, this));
        for (var o = 0; o < s.length; o++) r.bind(function (n) {
          t.event(i, n.down, r.bind(function (a) {
            n.accessor(a) && (this._settings.original_target = e(a), t.config.touch ? (this.clearDragTimer(), this._drag_start_timer = setTimeout(r.bind(function () {
              this.dragStart(i, a, n)
            }, this), t.config.touch_drag)) : this.dragStart(i, a, n))
          }, this)), t.event(document.body, n.up, r.bind(function (t) {
            n.accessor(t) && this.clearDragTimer()
          }, this))
        }, this)(s[o])
      }

      return i.prototype = {
        traceDragEvents: function (e, i) {
          var n = r.bind(function (t) {
            return this.dragMove(e, t, i.accessor)
          }, this);
          r.bind(function (t) {
            return this.dragScroll(e, t)
          }, this);
          var s = r.bind(function (t) {
            if (!this.config.started || !r.defined(this.config.updates_per_second) || a(this, this.config.updates_per_second)) {
              var e = n(t);
              return e && (t && t.preventDefault && t.preventDefault(), t.cancelBubble = !0), e
            }
          }, this), o = r.bind(function (n) {
            return t.eventRemove(document.body, i.move, s), t.eventRemove(document.body, i.up, o), this.dragEnd(e)
          }, this);
          t.event(document.body, i.move, s), t.event(document.body, i.up, o)
        }, checkPositionChange: function (t) {
          var e = t.x - this.config.pos.x, i = t.y - this.config.pos.y;
          return Math.sqrt(Math.pow(Math.abs(e), 2) + Math.pow(Math.abs(i), 2)) > this.config.sensitivity
        }, initDnDMarker: function () {
          var t = this.config.marker = document.createElement("div");
          t.className = "jsgantt-drag-marker", t.innerHTML = "Dragging object", document.body.appendChild(t)
        }, backupEventTarget: function (i, n) {
          if (t.config.touch) {
            var r = n(i), a = r.target, s = a.cloneNode(!0);
            this.config.original_target = e(r), this.config.original_target.target = s, this.config.backup_element = a, a.parentNode.appendChild(s), a.style.display = "none", document.body.appendChild(a)
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
            var a = this.getPosition(r);
            if (t.config.touch || this.checkPositionChange(a)) {
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
          for (var n = "var temp=date.match(/[a-zA-Z]+|[0-9]+/g);", r = e.match(/%[a-zA-Z]/g), a = 0; a < r.length; a++) switch (r[a]) {
            case"%j":
            case"%d":
              n += "set[2]=temp[" + a + "]||1;";
              break;
            case"%n":
            case"%m":
              n += "set[1]=(temp[" + a + "]||1)-1;";
              break;
            case"%y":
              n += "set[0]=temp[" + a + "]*1+(temp[" + a + "]>50?1900:2000);";
              break;
            case"%g":
            case"%G":
            case"%h":
            case"%H":
              n += "set[3]=temp[" + a + "]||0;";
              break;
            case"%i":
              n += "set[4]=temp[" + a + "]||0;";
              break;
            case"%Y":
              n += "set[0]=temp[" + a + "]||0;";
              break;
            case"%a":
            case"%A":
              n += "set[3]=set[3]%12+((temp[" + a + "]||'').toLowerCase()=='am'?0:12);";
              break;
            case"%s":
              n += "set[5]=temp[" + a + "]||0;";
              break;
            case"%M":
              n += "set[1]=locale.date.month_short_hash[temp[" + a + "]]||0;";
              break;
            case"%F":
              n += "set[1]=locale.date.month_full_hash[temp[" + a + "]]||0;"
          }
          var s = "set[0],set[1],set[2],set[3],set[4],set[5]";
          i && (s = " Date.UTC(" + s + ")");
          var o = new Function("date", "locale", "var set=[0,0,1,0,0,0]; " + n + " return new Date(" + s + ");");
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
          var r = n.getFullYear(), a = Math.round((n.getTime() - new Date(r, 0, 1).getTime()) / 864e5);
          return 1 + Math.floor(a / 7)
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
        columns: [{name: "jobChain", tree: !0, label: "Workflow", align: "left"}, {
          name: "orderId",
          label: "Order Id",
          width: "*",
          align: "left"
        }],
        btnRemoveOrder: "Remove Order",
        btnChangeParameter: "Change Parameter",
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
        sort: !0,
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
      var a = i(0);
      a.mixin(t, a), t.Promise = i(146), t.env = i(8);
      var s = i(1);
      t.utils = {
        dom: {
          getNodePosition: s.getNodePosition,
          getRelativeEventPosition: s.getRelativeEventPosition,
          isChildOf: s.isChildOf,
          hasClass: s.hasClass,
          closest: s.closest
        }
      };
      var o = i(20)();
      t.event = o.attach, t.eventRemove = o.detach, t._eventRemoveAll = o.detachAll, t._createDomEventScope = o.extend, a.mixin(t, i(142)(t));
      var l = i(141).init(t);
      t.$ui = l.factory, t.$ui.layers = l.render, t.$mouseEvents = l.mouseEvents, t.$services.setService("mouseEvents", function () {
        return t.$mouseEvents
      }), t.mixin(t, l.layersApi), i(102)(t), t.$services.setService("layers", function () {
        return l.layersService
      });
      var c = i(101);
      t.mixin(t, c()), i(100)(t);
      var d = i(94);
      return t.createDataProcessor = d.createDataProcessor, i(90)(t), i(81)(t), i(80)(t), i(78)(t), i(77)(t), i(76)(t), i(75)(t), i(66)(t), i(65)(t), i(55)(t), i(54)(t), i(52)(t), i(51)(t), i(50)(t), i(49)(t), i(48)(t), i(47)(t), i(46)(t), i(45)(t), i(44)(t), i(43)(t), i(42)(t), i(41)(t), i(39)(t), t
    }
  }, function (t, e, i) {
    var n = {
      _seed: 0, getGanttInstance: function () {
        let t = i(157)();
        return t._internal_id = n._seed++, n.$syncFactory && n.$syncFactory(t), i(38)(t), t
      }
    };
    t.exports = n
  }, function (t, e, i) {
    let n = i(158);
    window.jsgantt = n.getGanttInstance()
  }])
};
