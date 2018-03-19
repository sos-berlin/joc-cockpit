!function () {
    "use strict";
    angular.module("gantt.bounds", ["gantt", "gantt.bounds.templates"]).directive("ganttBounds", ["moment", "$compile", "$document", function (a, b, c) {
        return {
            restrict: "E", require: "^gantt", scope: {enabled: "=?"}, link: function (d, e, f, g) {
                var h = g.gantt.api;
                if (d.options && "object" == typeof d.options.bounds)for (var i in d.options.bounds)d[i] = d.options[i];
                void 0 === d.enabled && (d.enabled = !0), h.directives.on.new(d, function (a, e, g) {
                    if ("ganttTask" === a) {
                        var h = e.$new();
                        h.pluginScope = d;
                        var i = c[0].createElement("div");
                        angular.element(i).attr("data-ng-if", "task.model.est && task.model.lct && pluginScope.enabled");
                        var j = c[0].createElement("gantt-task-bounds");
                        void 0 !== f.templateUrl && angular.element(j).attr("data-template-url", f.templateUrl), void 0 !== f.template && angular.element(j).attr("data-template", f.template), angular.element(i).append(j), g.append(b(i)(h))
                    }
                }), h.tasks.on.clean(d, function (b) {
                    void 0 === b.est || a.isMoment(b.est) || (b.est = a(b.est)), void 0 === b.lct || a.isMoment(b.lct) || (b.lct = a(b.lct))
                })
            }
        }
    }])
}(), function () {
    "use strict";
    angular.module("gantt.dependencies", ["gantt", "gantt.dependencies.templates"]).directive("ganttDependencies", ["$timeout", "$document", "ganttDebounce", "GanttDependenciesManager", "GanttDependenciesChecker", function (a, b, c, d, e) {
        return {
            restrict: "E",
            require: "^gantt",
            scope: {
                enabled: "=?",
                readOnly: "=?",
                jsPlumbDefaults: "=?",
                endpoints: "=?",
                fallbackEndpoints: "=?",
                conflictChecker: "=?"
            },
            link: function (a, b, f, g) {
                function h() {
                    return angular.element('<span><span class="gantt-endpoint-overlay start-endpoint arrow-right"></span></span>')
                }

                function i() {
                    return angular.element('<span><span class="gantt-endpoint-overlay end-endpoint arrow-right"></span></span>')
                }

                function j() {
                    return angular.element('<span><span class="gantt-endpoint-overlay start-endpoint fallback-endpoint"></span></span>')
                }

                function k() {
                    return angular.element('<span><span class="gantt-endpoint-overlay end-endpoint fallback-endpoint"></span></span>')
                }

                var l = g.gantt.api;
                if (a.options && "object" == typeof a.options.dependencies)for (var m in a.options.dependencies)a[m] = a.options[m];
                void 0 === a.enabled && (a.enabled = !0), void 0 === a.readOnly && (a.readOnly = !1), void 0 === a.jsPlumbDefaults && (a.jsPlumbDefaults = {
                    Endpoint: ["Dot", {radius: 4}],
                    EndpointStyle: {fillStyle: "#456", strokeStyle: "#456", lineWidth: 1},
                    Connector: "Flowchart",
                    ConnectionOverlays: [["Arrow", {location: 1, length: 12, width: 12}]]
                }), void 0 === a.endpoints && (a.endpoints = [{
                    anchor: "Left",
                    isSource: !1,
                    isTarget: !0,
                    maxConnections: -1,
                    cssClass: "gantt-endpoint start-endpoint target-endpoint",
                    overlays: [["Custom", {create: h}]]
                }, {
                    anchor: "Right",
                    isSource: !0,
                    isTarget: !1,
                    maxConnections: -1,
                    cssClass: "gantt-endpoint end-endpoint source-endpoint",
                    overlays: [["Custom", {create: i}]]
                }]), void 0 === a.fallbackEndpoints && (a.fallbackEndpoints = [{
                    endpoint: "Blank",
                    anchor: "Left",
                    isSource: !1,
                    isTarget: !0,
                    maxConnections: 0,
                    cssClass: "gantt-endpoint start-endpoint fallback-endpoint",
                    overlays: [["Custom", {create: j}]]
                }, {
                    endpoint: "Blank",
                    anchor: "Right",
                    isSource: !0,
                    isTarget: !1,
                    maxConnections: 0,
                    cssClass: "gantt-endpoint end-endpoint fallback-endpoint",
                    overlays: [["Custom", {create: k}]]
                }]), void 0 === a.conflictChecker && (a.conflictChecker = !1);
                var n = new d(g.gantt, a, l), o = new e(n, a, l);
                a.$watchGroup(["conflictChecker", "enabled"], function (b, c) {
                    if (b !== c) {
                        for (var d = g.gantt.rowsManager.rows, e = [], f = 0; f < d.length; f++)e.push.apply(e, d[f].tasks);
                        a.conflictChecker && a.enabled ? o.refresh(e) : o.clear(e)
                    }
                }), l.directives.on.new(a, function (a, b, c) {
                    "ganttBody" === a && n.plumb.setContainer(c)
                }), l.tasks.on.add(a, function (a) {
                    n.addDependenciesFromTask(a)
                }), l.tasks.on.remove(a, function (a) {
                    n.removeDependenciesFromTask(a)
                }), l.tasks.on.displayed(a, c(function (b) {
                    n.setTasks(b), n.refresh(), a.conflictChecker && a.enabled && o.refresh(b)
                })), l.rows.on.displayed(a, function () {
                    n.refresh()
                }), l.tasks.on.viewChange(a, function (b) {
                    b.$element && n.plumb.revalidate(b.$element[0]), a.conflictChecker && a.enabled && o.refresh([b])
                }), l.tasks.on.viewRowChange(a, function (b) {
                    n.setTask(b), a.conflictChecker && a.enabled && o.refresh([b])
                }), l.dependencies.on.add(a, function (b) {
                    a.conflictChecker && a.enabled && o.refresh([b.getFromTask(), b.getToTask()])
                }), l.dependencies.on.change(a, function (b) {
                    a.conflictChecker && a.enabled && o.refresh([b.getFromTask(), b.getToTask()])
                }), l.dependencies.on.remove(a, function (b) {
                    a.conflictChecker && a.enabled && o.refresh([b.getFromTask(), b.getToTask()])
                })
            }
        }
    }])
}(), function () {
    "use strict";
    angular.module("gantt.drawtask", ["gantt"]).directive("ganttDrawTask", ["$document", "ganttMouseOffset", "ganttUtils", "moment", function (a, b, c, d) {
        return {
            restrict: "E",
            require: "^gantt",
            scope: {enabled: "=?", moveThreshold: "=?", taskFactory: "=?"},
            link: function (e, f, g, h) {
                var i = h.gantt.api;
                void 0 === e.enabled && (e.enabled = !0), void 0 === e.moveThreshold && (e.moveThreshold = 0), void 0 === e.taskFactory && (e.taskFactory = function () {
                    return {}
                }), i.registerEvent("tasks", "draw"), i.registerEvent("tasks", "drawBegin"), i.registerEvent("tasks", "drawEnd");
                var j = function (a) {
                    return a.model.drawTask && angular.isFunction(a.model.drawTask.taskFactory) ? a.model.drawTask.taskFactory() : e.taskFactory()
                };
                i.directives.on.new(e, function (f, g, h) {
                    if ("ganttRow" === f) {
                        var k = function (a) {
                            var b = i.core.getDateByPosition(a, !0), c = d(b), e = j(g.row);
                            e.from = b, e.to = c;
                            var f = g.row.addTask(e);
                            return f.isResizing = !0, f.updatePosAndSize(), g.row.updateVisibleTasks(), g.row.$scope.$digest(), f
                        }, l = function (b) {
                            var c = function () {
                                g.row.rowsManager.gantt.api.tasks.raise.draw(b)
                            };
                            g.row.rowsManager.gantt.api.tasks.raise.drawBegin(b), a.on("mousemove", c), a.one("mouseup", function () {
                                g.row.rowsManager.gantt.api.tasks.raise.drawEnd(b), a.off("mousemove", c)
                            })
                        }, m = function (c) {
                            var d = function (a) {
                                var f = b.getOffset(a).x;
                                if (Math.abs(c - f) >= e.moveThreshold) {
                                    h.off("mousemove", d);
                                    var g = k(c);
                                    l(g)
                                }
                            };
                            h.on("mousemove", d), a.one("mouseup", function () {
                                h.off("mousemove", d)
                            })
                        }, n = function (a) {
                            var d = a.target ? a.target : a.srcElement, f = g.row.model.drawTask;
                            ("boolean" == typeof f || angular.isFunction(f)) && (f = {enabled: f});
                            var h = c.firstProperty([f], "enabled", e.enabled), i = angular.isFunction(h) ? h(a, g.row) : h;
                            if (i && d.className.indexOf("gantt-row") > -1) {
                                var j = b.getOffset(a).x;
                                if (0 === e.moveThreshold) {
                                    var n = k(j);
                                    l(n)
                                } else m(j)
                            }
                        };
                        h.on("mousedown", n), g.drawTaskHandler = n
                    }
                }), i.directives.on.destroy(e, function (a, b, c) {
                    "ganttRow" === a && (c.off("mousedown", b.drawTaskHandler), delete b.drawTaskHandler)
                })
            }
        }
    }])
}(), function () {
    "use strict";
    angular.module("gantt.groups", ["gantt", "gantt.groups.templates"]).directive("ganttGroups", ["ganttUtils", "GanttHierarchy", "$compile", "$document", function (a, b, c, d) {
        return {
            restrict: "E", require: "^gantt", scope: {enabled: "=?", display: "=?"}, link: function (a, e, f, g) {
                function h() {
                    a.hierarchy.refresh(g.gantt.rowsManager.filteredRows)
                }

                var i = g.gantt.api;
                if (a.options && "object" == typeof a.options.sortable)for (var j in a.options.sortable)a[j] = a.options[j];
                void 0 === a.enabled && (a.enabled = !0), void 0 === a.display && (a.display = "group"), a.hierarchy = new b, g.gantt.api.registerMethod("groups", "refresh", h, this), g.gantt.$scope.$watchCollection("gantt.rowsManager.filteredRows", function () {
                    h()
                }), i.directives.on.new(a, function (b, e, g) {
                    if ("ganttRow" === b) {
                        var h = e.$new();
                        h.pluginScope = a;
                        var i = d[0].createElement("div");
                        angular.element(i).attr("data-ng-if", "pluginScope.enabled");
                        var j = d[0].createElement("gantt-task-group");
                        void 0 !== f.templateUrl && angular.element(j).attr("data-template-url", f.templateUrl), void 0 !== f.template && angular.element(j).attr("data-template", f.template), angular.element(i).append(j), g.append(c(i)(h))
                    }
                })
            }
        }
    }])
}(), function () {
    "use strict";
    angular.module("gantt.labels", ["gantt", "gantt.labels.templates"]).directive("ganttLabels", ["ganttUtils", "$compile", "$document", "$log", function (a, b, c, d) {
        return {
            restrict: "E", require: "^gantt", scope: {enabled: "=?", header: "=?"}, link: function (a, e, f, g) {
                function h() {
                    for (var a = g.gantt.side.$element[0].getElementsByClassName("gantt-row-label"), b = 0, c = 0; c < a.length; c++) {
                        var d = a[c].children[0].offsetWidth;
                        b = Math.max(b, d)
                    }
                    b >= 0 && i.side.setWidth(b)
                }

                var i = g.gantt.api;
                if (d.warn("Angular Gantt Labels plugin is deprecated. Please use Table plugin instead."), a.options && "object" == typeof a.options.sortable)for (var j in a.options.sortable)a[j] = a.options[j];
                void 0 === a.enabled && (a.enabled = !0), void 0 === a.header && (a.header = "Name"), i.directives.on.new(a, function (d, e, f) {
                    if ("ganttSideContent" === d) {
                        var g = e.$new();
                        g.pluginScope = a;
                        var h = c[0].createElement("div");
                        angular.element(h).attr("data-ng-if", "pluginScope.enabled"), angular.element(h).addClass("side-element");
                        var i = c[0].createElement("gantt-side-content-labels");
                        angular.element(h).append(i), f.append(b(h)(g))
                    }
                }), i.registerMethod("labels", "fitSideWidth", h, this)
            }
        }
    }])
}(), function () {
    "use strict";
    angular.module("gantt.movable", ["gantt"]).directive("ganttMovable", ["ganttMouseButton", "ganttMouseOffset", "ganttSmartEvent", "ganttMovableOptions", "ganttUtils", "ganttDom", "$window", "$document", "$timeout", function (a, b, c, d, e, f, g, h, i) {
        return {
            restrict: "E",
            require: "^gantt",
            scope: {enabled: "=?", allowMoving: "=?", allowResizing: "=?", allowRowSwitching: "=?"},
            link: function (j, k, l, m) {
                var n = m.gantt.api;
                if (j.options && "object" == typeof j.options.movable)for (var o in j.options.movable)j[o] = j.options[o];
                d.initialize(j), n.registerEvent("tasks", "move"), n.registerEvent("tasks", "moveBegin"), n.registerEvent("tasks", "moveEnd"), n.registerEvent("tasks", "resize"), n.registerEvent("tasks", "resizeBegin"), n.registerEvent("tasks", "resizeEnd"), n.registerEvent("tasks", "change");
                var p, q, r = "ontouchstart"in g || g.DocumentTouch && h[0]instanceof g.DocumentTouch, s = "touchstart mousedown", t = "touchmove mousemove", u = "touchend mouseup", v = 15, w = 5, x = 3, y = 15, z = 5;
                n.directives.on.new(j, function (d, k, l) {
                    if ("ganttTask" === d) {
                        var n, o = angular.element(g), A = k.row.rowsManager.gantt.body.$element, B = k.row.rowsManager.gantt.scroll.$element, C = !1, D = !1, E = k.task.getForegroundElement(), F = k.task.getContentElement(), G = function (c) {
                            c.preventDefault(), r && (c = b.getTouch(c));
                            var d = k.task.model.movable, f = k.task.row.model.movable;
                            ("boolean" == typeof d || angular.isFunction(d)) && (d = {enabled: d}), ("boolean" == typeof f || angular.isFunction(f)) && (f = {enabled: f});
                            var g = e.firstProperty([d, f], "enabled", j.enabled), h = angular.isFunction(g) ? g(c, k.task) : g;
                            if (h) {
                                var i = b.getOffsetForElement(E[0], c).x, l = M(i);
                                if ("" !== l && 1 === a.getButton(c)) {
                                    var m = b.getOffsetForElement(A[0], c).x;
                                    P(l, m)
                                }
                                k.$digest()
                            }
                        };
                        E.on(s, G), F.on(s, G);
                        var H = function (a) {
                            var c = k.task.model.movable, d = k.task.row.model.movable;
                            ("boolean" == typeof c || angular.isFunction(c)) && (c = {enabled: c}), ("boolean" == typeof d || angular.isFunction(d)) && (d = {enabled: d});
                            var f = e.firstProperty([c, d], "enabled", j.enabled), g = angular.isFunction(f) ? f(a, k.task) : f;
                            if (g && !k.task.isMoving) {
                                var h = b.getOffsetForElement(E[0], a).x, i = M(h);
                                "" !== i && "M" !== i ? (E.css("cursor", N(i)), F.css("cursor", N(i))) : (E.css("cursor", ""), F.css("cursor", ""))
                            }
                        };
                        E.on("mousemove", H), F.on("mousemove", H);
                        var I = function (a) {
                            k.task.isMoving && !k.destroyed && (L(), J(a), K(a))
                        }, J = function (a) {
                            var c = C, d = b.getOffsetForElement(A[0], a), g = d.x;
                            k.task.mouseOffsetX = g;
                            var i = k.task.row.rowsManager.gantt.options.value("taskOutOfRange"), l = k.task.model.movable, n = k.task.row.model.movable;
                            if (("boolean" == typeof l || angular.isFunction(l)) && (l = {enabled: l}), ("boolean" == typeof n || angular.isFunction(n)) && (n = {enabled: n}), "M" === k.task.moveMode) {
                                var o = e.firstProperty([l, n], "allowRowSwitching", j.allowRowSwitching);
                                if (o) {
                                    var q = B[0].getBoundingClientRect(), r = q.left + q.width / 2, s = angular.element(h[0].querySelectorAll(".gantt-body"));
                                    s.css("pointer-events", "auto");
                                    var t = f.findElementFromPoint(r, a.clientY, function (a) {
                                        return angular.element(a).hasClass("gantt-row")
                                    });
                                    s.css("pointer-events", "");
                                    for (var u, v = m.gantt.rowsManager.rows, w = 0, x = v.length; x > w; w++)if (t === v[w].$element[0]) {
                                        u = v[w];
                                        break
                                    }
                                    var y = k.task.row;
                                    void 0 !== u && y !== u && (u.moveTaskToRow(k.task, !0), C = !0)
                                }
                                var z = e.firstProperty([l, n], "allowMoving", j.allowMoving);
                                z && (g -= p, "truncate" !== i && (0 > g ? g = 0 : g + k.task.width >= k.gantt.width && (g = k.gantt.width - k.task.width)), k.task.moveTo(g, !0), k.$digest(), C && k.row.rowsManager.gantt.api.tasks.raise.move(k.task), C = !0)
                            } else"E" === k.task.moveMode ? (g <= k.task.left && (g = k.task.left, k.task.moveMode = "W", O(N(k.task.moveMode))), "truncate" !== i && g >= k.gantt.width && (g = k.gantt.width), k.task.setTo(g, !0), k.$digest(), C && k.row.rowsManager.gantt.api.tasks.raise.resize(k.task), C = !0) : (g > k.task.left + k.task.width && (g = k.task.left + k.task.width, k.task.moveMode = "E", O(N(k.task.moveMode))), "truncate" !== i && 0 > g && (g = 0), k.task.setFrom(g, !0), k.$digest(), C && k.row.rowsManager.gantt.api.tasks.raise.resize(k.task), C = !0);
                            if (!c && C && !D) {
                                var E = k.task.getBackgroundElement();
                                "M" === k.task.moveMode ? (E.addClass("gantt-task-moving"), k.row.rowsManager.gantt.api.tasks.raise.moveBegin(k.task)) : (E.addClass("gantt-task-resizing"), k.row.rowsManager.gantt.api.tasks.raise.resizeBegin(k.task))
                            }
                        }, K = function (a) {
                            var c = b.getOffsetForElement(A[0], a), d = B[0].scrollLeft, e = B[0].offsetWidth, f = B[0].scrollWidth, g = d + e, h = !1;
                            c.x < q ? d > 0 && c.x <= d + z && (c.x -= y, h = !0, k.row.rowsManager.gantt.api.scroll.left(y)) : f > g && c.x >= g - z && (c.x += y, h = !0, k.row.rowsManager.gantt.api.scroll.right(y)), h && (n = i(function () {
                                I(a)
                            }, 100, !0))
                        }, L = function () {
                            void 0 !== n && (i.cancel(n), n = void 0)
                        }, M = function (a) {
                            var b = 0, c = k.task.model.movable, d = k.task.row.model.movable;
                            "boolean" == typeof c && (c = {enabled: c}), "boolean" == typeof d && (d = {enabled: d});
                            var f = e.firstProperty([c, d], "allowResizing", j.allowResizing), g = e.firstProperty([c, d], "allowRowSwitching", j.allowRowSwitching), h = e.firstProperty([c, d], "allowMoving", j.allowMoving);
                            return f && (b = E[0].offsetWidth < v ? x : w), f && a > E[0].offsetWidth - b ? "E" : f && b > a ? "W" : (h || g) && a >= b && a <= E[0].offsetWidth - b ? "M" : ""
                        }, N = function (a) {
                            switch (a) {
                                case"E":
                                    return "e-resize";
                                case"W":
                                    return "w-resize";
                                case"M":
                                    return "move"
                            }
                        }, O = function (a) {
                            l.css("cursor", a), angular.element(h[0].body).css({
                                "-moz-user-select": "" === a ? "" : "-moz-none",
                                "-webkit-user-select": "" === a ? "" : "none",
                                "-ms-user-select": "" === a ? "" : "none",
                                "user-select": "" === a ? "" : "none",
                                cursor: a
                            })
                        }, P = function (a, d) {
                            void 0 === k.task.originalModel && (k.task.originalRow = k.task.row, k.task.originalModel = k.task.model, k.task.model = angular.copy(k.task.originalModel)), D || (q = d, p = d - k.task.modelLeft), C = !1, k.task.moveMode = a, k.task.isMoving = !0, k.task.active = !0;
                            var e = function (a) {
                                a.stopImmediatePropagation(), r && (a = b.getTouch(a)), I(a)
                            }, f = c(k, o, t, e);
                            f.bind(), c(k, o, u, function (a) {
                                r && (a = b.getTouch(a)), f.unbind(), Q(a), k.$digest()
                            }).bindOnce(), O(N(a))
                        }, Q = function () {
                            var a = k.task.getBackgroundElement();
                            if (a.removeClass("gantt-task-moving"), a.removeClass("gantt-task-resizing"), void 0 !== k.task.originalModel) {
                                if (k.task.originalModel.from = k.task.model.from, k.task.originalModel.to = k.task.model.to, k.task.originalModel.lct = k.task.model.lct, k.task.originalModel.est = k.task.model.est, k.task.model = k.task.originalModel, k.task.row.model.id !== k.task.originalRow.model.id) {
                                    var b = k.task.row;
                                    b.removeTask(k.task.model.id, !1, !0), k.task.row = k.task.originalRow, b.moveTaskToRow(k.task, !1)
                                }
                                delete k.task.originalModel, delete k.task.originalRow, k.$apply()
                            }
                            D = !1, k.task.isMoving = !1, k.task.active = !1, L(), O(""), C === !0 && ("M" === k.task.moveMode ? k.row.rowsManager.gantt.api.tasks.raise.moveEnd(k.task) : k.row.rowsManager.gantt.api.tasks.raise.resizeEnd(k.task), C = !1, k.task.row.sortTasks(), k.row.rowsManager.gantt.api.tasks.raise.change(k.task)), k.task.moveMode = void 0
                        };
                        k.$on("$destroy", function () {
                            k.destroyed = !0, L()
                        }), k.task.isResizing ? (D = !0, P("E", k.task.mouseOffsetX), delete k.task.isResizing) : k.task.isMoving && (D = !0, P("M", k.task.mouseOffsetX))
                    }
                })
            }
        }
    }])
}(), function () {
    "use strict";
    angular.module("gantt.overlap", ["gantt", "gantt.overlap.templates"]).directive("ganttOverlap", ["moment", "$timeout", function (a, b) {
        return {
            restrict: "E", require: "^gantt", scope: {enabled: "=?", global: "=?"}, link: function (c, d, e, f) {
                function g(a) {
                    var b, c;
                    return a.model.from.isBefore(a.model.to) ? (b = a.model.from, c = a.model.to) : (b = a.model.to, c = a.model.from), [b, c]
                }

                function h(b) {
                    var c = g(b);
                    return a().range(c[0], c[1])
                }

                function i(a, b) {
                    b.model.id in a || !b.$element || (b.$element.addClass("gantt-task-overlaps"), a[b.model.id] = b)
                }

                function j(a, b) {
                    for (var c = 0, d = b.length; d > c; c++) {
                        var e = b[c];
                        e.model.id in a || !e.$element || e.$element.removeClass("gantt-task-overlaps")
                    }
                }

                function k(a) {
                    var b = {};
                    if (a.length > 1)for (var c = a[0], d = h(c), e = 1, f = a.length; f > e; e++) {
                        var g = a[e], k = h(g);
                        k.overlaps(d) && (i(b, g), i(b, c)), c.left + c.width < g.left + g.width && (c = g, d = k)
                    }
                    j(b, a)
                }

                function l(a, b) {
                    return a.sort(function (a, c) {
                        return b(a) < b(c) ? -1 : b(a) > b(c) ? 1 : 0
                    })
                }

                function m(a) {
                    for (var b = [], c = 0; c < a.length; c++)b.push.apply(b, a[c].tasks);
                    b = l(b, function (a) {
                        return a.model.from
                    }), k(b)
                }

                var n = f.gantt.api;
                void 0 === c.enabled && (c.enabled = !0), void 0 === c.global && (c.global = !1), c.enabled && (n.data.on.change(c, function () {
                    b(function () {
                        var a = n.gantt.rowsManager.rows;
                        if (c.global)m(a); else for (var b = 0; b < a.length; b++)k(a[b].tasks)
                    })
                }), n.tasks.on.change(c, function (a) {
                    if (c.global) {
                        var b = a.row.rowsManager.rows;
                        m(b)
                    } else k(a.row.tasks)
                }), n.tasks.on.rowChange(c, function (a, b) {
                    if (c.global) {
                        var d = b.rowsManager.rows;
                        m(d)
                    } else k(b.tasks)
                }), n.tasks.on.add(c, function (a) {
                    b(function () {
                        if (c.global) {
                            var b = a.row.rowsManager.rows;
                            m(b)
                        } else k(a.row.tasks)
                    })
                }))
            }
        }
    }])
}(), function () {
    "use strict";
    angular.module("gantt.progress", ["gantt", "gantt.progress.templates"]).directive("ganttProgress", ["moment", "$compile", "$document", function (a, b, c) {
        return {
            restrict: "E", require: "^gantt", scope: {enabled: "=?"}, link: function (d, e, f, g) {
                var h = g.gantt.api;
                if (d.options && "object" == typeof d.options.progress)for (var i in d.options.progress)d[i] = d.options[i];
                void 0 === d.enabled && (d.enabled = !0), h.directives.on.new(d, function (a, e, g) {
                    if ("ganttTaskBackground" === a) {
                        var h = e.$new();
                        h.pluginScope = d;
                        var i = c[0].createElement("div");
                        angular.element(i).attr("data-ng-if", "task.model.progress !== undefined && pluginScope.enabled");
                        var j = c[0].createElement("gantt-task-progress");
                        void 0 !== f.templateUrl && angular.element(j).attr("data-template-url", f.templateUrl), void 0 !== f.template && angular.element(j).attr("data-template", f.template), angular.element(i).append(j), g.append(b(i)(h))
                    }
                }), h.tasks.on.clean(d, function (b) {
                    void 0 === b.est || a.isMoment(b.est) || (b.est = a(b.est)), void 0 === b.lct || a.isMoment(b.lct) || (b.lct = a(b.lct))
                })
            }
        }
    }])
}(), function () {
    "use strict";
    angular.module("gantt.resizeSensor", ["gantt"]).directive("ganttResizeSensor", [function () {
        return {
            restrict: "E", require: "^gantt", scope: {enabled: "=?"}, link: function (a, b, c, d) {
                function e() {
                    var a = b.parent().parent().parent()[0].querySelectorAll("div.gantt")[0];
                    return new ResizeSensor(a, function () {
                        d.gantt.$scope.ganttElementWidth = a.clientWidth, d.gantt.$scope.$apply()
                    })
                }

                var f = d.gantt.api;
                if (a.options && "object" == typeof a.options.progress)for (var g in a.options.progress)a[g] = a.options[g];
                void 0 === a.enabled && (a.enabled = !0);
                var h, i = !1;
                f.core.on.rendered(a, function () {
                    i = !0, void 0 !== h && h.detach(), a.enabled && (ElementQueries.update(), h = e())
                }), a.$watch("enabled", function (a) {
                    i && (a && void 0 === h ? (ElementQueries.update(), h = e()) : a || void 0 === h || (h.detach(), h = void 0))
                })
            }
        }
    }])
}(), function () {
    "use strict";
    for (var a, b = "gantt.sortable", c = "ganttSortable", d = ["gantt", {
        module: "ang-drag-drop",
        url: "https://github.com/ganarajpr/angular-dragdrop.git#master"
    }], e = [], f = [], g = 0, h = d.length; h > g; g++) {
        var i = d[g];
        try {
            angular.isString(i) && (i = {module: i}, d[g] = i), angular.module(i.module), f.push(i.module)
        } catch (a) {
            i.exception = a, e.push(i)
        }
    }
    e.length > 0 ? angular.module(b, []).directive(c, ["$log", function (d) {
        return {
            restrict: "E", require: "^gantt", scope: {enabled: "=?"}, link: function () {
                d.warn(b + " module can't require some dependencies:");
                for (var f = 0, g = e.length; g > f; f++) {
                    a = e[f];
                    var h = a.module;
                    a.url && (h += " (" + a.url + ")"), a.exception && a.exception.message && (h += ": " + a.exception.message), d.warn(h)
                }
                d.warn(c + " plugin directive won't be available")
            }
        }
    }]) : angular.module(b, f).directive(c, ["ganttUtils", "$compile", function (a, b) {
        return {
            restrict: "E", require: "^gantt", scope: {enabled: "=?"}, link: function (c, d, e, f) {
                var g = f.gantt.api;
                if (c.options && "object" == typeof c.options.sortable)for (var h in c.options.sortable)c[h] = c.options[h];
                void 0 === c.enabled && (c.enabled = !0), g.directives.on.new(c, function (d, e, f) {
                    "ganttRowLabel" === d && void 0 === f.attr("drag") && (e.checkDraggable = function () {
                        var b = e.row.model.sortable;
                        return "boolean" == typeof b && (b = {enabled: b}), a.firstProperty([b], "enabled", c.enabled)
                    }, e.onDropSuccess = function () {
                        e.$evalAsync()
                    }, e.onDrop = function (a, b) {
                        var c = e.row.rowsManager.rowsMap[b.id];
                        c !== e && (e.row.rowsManager.moveRow(c, e.row), e.$evalAsync())
                    }, f.attr("ui-draggable", "{{checkDraggable()}}"), f.attr("drag-channel", "'sortable'"), f.attr("ui-on-drop", "onDrop($event, $data)"), f.attr("on-drop-success", "onDropSuccess()"), f.attr("drop-channel", "'sortable'"), f.attr("drag", "row.model"), b(f)(e))
                })
            }
        }
    }])
}(), function () {
    "use strict";
    angular.module("gantt.table", ["gantt", "gantt.table.templates"]).directive("ganttTable", ["ganttUtils", "$compile", "$document", function (a, b, c) {
        return {
            restrict: "E",
            require: "^gantt",
            scope: {
                enabled: "=?",
                columns: "=?",
                headers: "=?",
                classes: "=?",
                contents: "=?",
                headerContents: "=?",
                formatters: "=?",
                headerFormatter: "=?"
            },
            link: function (a, d, e, f) {
                var g = f.gantt.api;
                if (a.options && "object" == typeof a.options.sortable)for (var h in a.options.sortable)a[h] = a.options[h];
                void 0 === a.enabled && (a.enabled = !0), void 0 === a.columns && (a.columns = ["model.name"]), void 0 === a.headers && (a.headers = {"model.name": "Name"}), void 0 === a.contents && (a.contents = {}), void 0 === a.headerContents && (a.headerContents = {}), void 0 === a.classes && (a.classes = {}), void 0 === a.formatters && (a.formatters = {}), g.directives.on.new(a, function (d, e, f) {
                    if ("ganttSideContent" === d) {
                        var g = e.$new();
                        g.pluginScope = a;
                        var h = c[0].createElement("div");
                        angular.element(h).attr("data-ng-if", "pluginScope.enabled"), angular.element(h).addClass("side-element");
                        var i = c[0].createElement("gantt-side-content-table");
                        angular.element(h).append(i), f.append(b(h)(g))
                    }
                })
            }
        }
    }])
}(), function () {
    "use strict";
    angular.module("gantt.tooltips", ["gantt", "gantt.tooltips.templates"]).directive("ganttTooltips", ["$compile", "$document", function (a, b) {
        return {
            restrict: "E",
            require: "^gantt",
            scope: {enabled: "=?", dateFormat: "=?", content: "=?", delay: "=?"},
            link: function (c, d, e, f) {
                var g = f.gantt.api;
                if (c.options && "object" == typeof c.options.tooltips)for (var h in c.options.tooltips)c[h] = c.options[h];
                void 0 === c.enabled && (c.enabled = !0), void 0 === c.dateFormat && (c.dateFormat = "MMM DD, HH:mm"), void 0 === c.delay && (c.delay = 500), void 0 === c.content && (c.content = "{{task.model.name}}</br>{{row.model.orderId}}</br><div class='m-t-xs m-b-xs'>{{task.model.startMode | translate}} <span ng-if='task.model.repeat' class='text-primary text-sm p-l-xs'>({{task.model.repeat}})</span></div><small class='text-muted'>{{task.isMilestone() === true && getFromLabel() || getFromLabel() + ' - ' + getToLabel()}}</small>"), c.api = g, g.directives.on.new(c, function (d, f, g) {
                    if ("ganttTask" === d) {
                        var h = f.$new();
                        h.pluginScope = c;
                        var i = b[0].createElement("div");
                        angular.element(i).attr("data-ng-if", "pluginScope.enabled");
                        var j = b[0].createElement("gantt-tooltip");
                        void 0 !== e.templateUrl && angular.element(j).attr("data-template-url", e.templateUrl), void 0 !== e.template && angular.element(j).attr("data-template", e.template), angular.element(i).append(j), g.append(a(i)(h))
                    }
                })
            }
        }
    }])
}(), function () {
    "use strict";
    angular.module("gantt.tree", ["gantt", "gantt.tree.templates", "ui.tree"]).directive("ganttTree", ["ganttUtils", "$compile", "$document", function (a, b, c) {
        return {
            restrict: "E",
            require: "^gantt",
            scope: {enabled: "=?", header: "=?", content: "=?", headerContent: "=?", keepAncestorOnFilterRow: "=?"},
            link: function (a, d, e, f) {
                var g = f.gantt.api;
                if (a.options && "object" == typeof a.options.sortable)for (var h in a.options.sortable)a[h] = a.options[h];
                void 0 === a.enabled && (a.enabled = !0), void 0 === a.header && (a.header = "Name"), void 0 === a.headerContent && (a.headerContent = "{{getHeader()}}"), void 0 === a.keepAncestorOnFilterRow && (a.keepAncestorOnFilterRow = !1), g.directives.on.new(a, function (d, e, f) {
                    if ("ganttSideContent" === d) {
                        var g = e.$new();
                        g.pluginScope = a;
                        var h = c[0].createElement("div");
                        angular.element(h).attr("data-ng-if", "pluginScope.enabled"), angular.element(h).addClass("side-element");
                        var i = c[0].createElement("gantt-side-content-tree");
                        angular.element(h).append(i), f.append(b(h)(g))
                    }
                })
            }
        }
    }])
}(), function () {
    "use strict";
    angular.module("gantt.bounds").directive("ganttTaskBounds", ["$templateCache", "moment", function (a, b) {
        return {
            restrict: "E", templateUrl: function (b, c) {
                var d;
                return d = void 0 === c.templateUrl ? "plugins/bounds/taskBounds.tmpl.html" : c.templateUrl, c.template && a.put(d, c.template), d
            }, replace: !0, scope: !0, controller: ["$scope", "$element", function (a, c) {
                c.toggleClass("ng-hide", !0), a.simplifyMoment = function (a) {
                    return b.isMoment(a) ? a.unix() : a
                }, a.$watchGroup(["simplifyMoment(task.model.est)", "simplifyMoment(task.model.lct)", "task.left", "task.width"], function () {
                    var b = a.task.rowsManager.gantt.getPositionByDate(a.task.model.est), d = a.task.rowsManager.gantt.getPositionByDate(a.task.model.lct);
                    c.css("left", b - a.task.left + "px"), c.css("width", d - b + "px"), c.toggleClass("gantt-task-bounds-in", !1), c.toggleClass("gantt-task-bounds-out", !1), void 0 === a.task.model.est || void 0 === a.task.model.lct ? c.toggleClass("gantt-task-bounds-in", !0) : a.task.model.est > a.task.model.from ? c.toggleClass("gantt-task-bounds-out", !0) : a.task.model.lct < a.task.model.to ? c.toggleClass("gantt-task-bounds-out", !0) : c.toggleClass("gantt-task-bounds-in", !0)
                }), a.task.$element.bind("mouseenter", function () {
                    c.toggleClass("ng-hide", !1)
                }), a.task.$element.bind("mouseleave", function () {
                    c.toggleClass("ng-hide", !0)
                }), a.task.rowsManager.gantt.api.directives.raise.new("ganttBounds", a, c), a.$on("$destroy", function () {
                    a.task.rowsManager.gantt.api.directives.raise.destroy("ganttBounds", a, c)
                })
            }]
        }
    }])
}(), function () {
    "use strict";
    angular.module("gantt.dependencies").factory("GanttDependenciesChecker", [function () {
        var a = function (a) {
            function b(a, b) {
                b.model.id in a || !b.$element || (b.$element.addClass("gantt-task-conflict"), a[b.model.id] = b)
            }

            function c(a, b) {
                for (var c = 0, d = b.length; d > c; c++) {
                    var e = b[c];
                    e.model.id in a || !e.$element || e.$element.removeClass("gantt-task-conflict")
                }
            }

            this.refresh = function (d) {
                for (var e = d.slice(0), f = [], g = 0; g < d.length; g++)for (var h = a.getTaskDependencies(d[g]), i = 0; i < h.length; i++) {
                    var j = h[i], k = j.getFromTask(), l = j.getToTask();
                    k in e || e.push(k), l in e || e.push(l), k.model.to > l.model.from && (b(f, k), b(f, l))
                }
                c(f, e)
            }, this.clear = function (a) {
                var b = a.slice(0);
                c([], b)
            }
        };
        return a
    }])
}(), function () {
    "use strict";
    angular.module("gantt.dependencies").factory("GanttDependenciesEvents", [function () {
        var a = function (a) {
            var b = this;
            this.manager = a;
            var c = function () {
                return !b.manager.pluginScope.readOnly
            };
            this.manager.plumb.bind("beforeDrag", c), this.manager.plumb.bind("beforeStartDetach", c);
            var d = function (a) {
                return a.sourceId !== a.targetId
            };
            this.manager.plumb.bind("beforeDrop", d), this.manager.plumb.bind("connectionDrag", function (a) {
                b.manager.setDraggingConnection(a)
            }), this.manager.plumb.bind("connectionDragStop", function () {
                b.manager.setDraggingConnection(void 0)
            }), this.manager.plumb.bind("beforeDrop", function () {
                return b.manager.setDraggingConnection(void 0), !0
            });
            var e = function (a, c) {
                if (c) {
                    var d;
                    a.connection.$dependency && (d = a.connection.$dependency);
                    var e = a.sourceEndpoint, f = a.targetEndpoint, g = e.$task.model, h = g.dependencies;
                    void 0 === h && (h = [], g.dependencies = h);
                    var i = {to: f.$task.model.id};
                    h.push(i), d && (d.removeFromTaskModel(), b.manager.removeDependency(d, !0));
                    var j = b.manager.addDependency(e.$task, i);
                    a.connection.$dependency = j, j.connection = a.connection, b.manager.api.dependencies.raise.add(j)
                }
            }, f = function (a, c) {
                if (c) {
                    var d;
                    a.connection.$dependency && (d = a.connection.$dependency);
                    var e = a.newSourceEndpoint, f = a.newTargetEndpoint, g = e.$task.model, h = g.dependencies;
                    void 0 === h && (h = [], g.dependencies = h);
                    var i = {to: f.$task.model.id};
                    h.push(i), d && (d.removeFromTaskModel(), b.manager.removeDependency(d, !0));
                    var j = b.manager.addDependency(e.$task, i);
                    a.connection.$dependency = j, j.connection = a.connection, b.manager.api.dependencies.raise.change(j, d)
                }
            }, g = function (a, c) {
                if (c) {
                    var d = a.connection.$dependency;
                    d.removeFromTaskModel(), b.manager.removeDependency(d, !0), b.manager.api.dependencies.raise.remove(d)
                }
            };
            this.manager.plumb.bind("connectionMoved", f), this.manager.plumb.bind("connection", e), this.manager.plumb.bind("connectionDetached", g)
        };
        return a
    }])
}(), function () {
    "use strict";
    angular.module("gantt.dependencies").factory("GanttDependenciesManager", ["GanttDependency", "GanttDependenciesEvents", "GanttDependencyTaskMouseHandler", function (a, b, c) {
        var d = function (d, e, f) {
            var g = this;
            this.gantt = d, this.pluginScope = e, this.api = f, this.api.registerEvent("dependencies", "add"), this.api.registerEvent("dependencies", "change"), this.api.registerEvent("dependencies", "remove"), this.plumb = jsPlumb.getInstance(), this.plumb.importDefaults(this.pluginScope.jsPlumbDefaults), this.dependenciesFrom = {}, this.dependenciesTo = {}, this.tasksList = [], this.tasks = {}, this.events = new b(this), this.pluginScope.$watch("enabled", function (a, b) {
                a !== b && g.refresh()
            }), this.pluginScope.$watch("readOnly", function (a, b) {
                a !== b && (g.setTasks(g.tasksList), g.refresh())
            }), this.pluginScope.$watch("jsPlumbDefaults", function (a, b) {
                a !== b && (g.plumb.importDefaults(a), g.refresh())
            }, !0), this.addDependenciesFromTask = function (a) {
                if (this.pluginScope.enabled) {
                    var b = a.model.dependencies;
                    if (void 0 !== b && b) {
                        angular.isArray(b) || (b = [b], a.model.dependencies = b);
                        for (var c = 0, d = b.length; d > c; c++) {
                            var e = g.addDependency(a, b[c]);
                            e.connect()
                        }
                    }
                }
            }, this.removeDependenciesFromTask = function (a, b) {
                var c = this.getTaskDependencies(a);
                if (c)for (var d = 0; d < c.length; d++)b || c[d].disconnect(), g.removeDependency(c[d])
            }, this.addDependency = function (b, c) {
                var d = new a(this, b, c), e = d.getFromTaskId(), f = d.getToTaskId();
                return e in this.dependenciesFrom || (this.dependenciesFrom[e] = []), f in this.dependenciesTo || (this.dependenciesTo[f] = []), e && this.dependenciesFrom[e].push(d), f && this.dependenciesTo[f].push(d), d
            }, this.removeDependency = function (a, b) {
                var c, d = this.dependenciesFrom[a.getFromTaskId()], e = [];
                if (d)for (c = 0; c < d.length; c++)a === d[c] && e.push(a);
                var f = this.dependenciesTo[a.getToTaskId()], g = [];
                if (f)for (c = 0; c < f.length; c++)a === f[c] && g.push(a);
                for (c = 0; c < e.length; c++)b || e[c].disconnect(), d.splice(d.indexOf(a), 1);
                for (c = 0; c < g.length; c++)b || g[c].disconnect(), f.splice(f.indexOf(a), 1);
                this.dependenciesFrom[a.getFromTaskId()] && 0 === this.dependenciesFrom[a.getFromTaskId()].length && delete this.dependenciesFrom[a.getFromTaskId()], this.dependenciesTo[a.getToTaskId()] && 0 === this.dependenciesTo[a.getToTaskId()].length && delete this.dependenciesTo[a.getToTaskId()]
            }, this.getTaskDependencies = function (a) {
                var b = [], c = g.dependenciesFrom[a.model.id];
                c && (b = b.concat(c));
                var d = g.dependenciesTo[a.model.id];
                return d && (b = b.concat(d)), b
            }, this.setDraggingConnection = function (a) {
                a ? (g.draggingConnection = a, angular.forEach(g.tasks, function (a) {
                    a.dependencies.mouseHandler.release()
                })) : (g.draggingConnection = void 0, angular.forEach(g.tasks, function (a) {
                    a.dependencies.mouseHandler.install()
                }))
            };
            var h = function (a) {
                var b = a.row.model.dependencies;
                if (void 0 !== b)return b !== !1;
                var c = a.model.dependencies;
                return void 0 === c || c !== !1
            }, i = function (a) {
                if (a.dependencies || (a.dependencies = {}), a.dependencies.endpoints = [], g.pluginScope.endpoints && a.$element)for (var b = 0; b < g.pluginScope.endpoints.length; b++) {
                    var c = g.plumb.addEndpoint(a.$element, g.pluginScope.endpoints[b]);
                    c.setVisible(!1, !0, !0), c.$task = a, a.dependencies.endpoints.push(c)
                }
            }, j = function (a) {
                if (a.dependencies.endpoints) {
                    for (var b = 0; b < a.dependencies.endpoints.length; b++) {
                        var c = a.dependencies.endpoints[b];
                        g.plumb.deleteEndpoint(c), c.$task = void 0
                    }
                    a.dependencies.endpoints = void 0
                }
            }, k = function (a) {
                a.dependencies || (a.dependencies = {}), g.pluginScope.readOnly || (a.dependencies.mouseHandler = new c(g, a), a.dependencies.mouseHandler.install())
            }, l = function (a) {
                a.dependencies.mouseHandler && (a.dependencies.mouseHandler.release(), a.dependencies.mouseHandler = void 0)
            };
            this.setTasks = function (a) {
                angular.forEach(g.tasks, function (a) {
                    l(a), j(a)
                });
                for (var b = {}, c = [], d = 0; d < a.length; d++) {
                    var e = a[d];
                    h(e) && (b[e.model.id] = e, c.push(e), i(e), k(e))
                }
                g.tasks = b, g.tasksList = a
            };
            var m = function (a) {
                var b = g.getTaskDependencies(a);
                if (b)for (var c = 0; c < b.length; c++)b[c].disconnect();
                return b
            }, n = function (a) {
                var b = g.getTaskDependencies(a);
                if (b)for (var c = 0; c < b.length; c++)b[c].connect();
                return b
            };
            this.setTask = function (a) {
                g.plumb.setSuspendDrawing(!0);
                try {
                    var b = g.tasks[a.model.id];
                    void 0 !== b && (m(b), l(b), j(b)), h(a) && (g.tasks[a.model.id] = a, i(a), k(a), n(a))
                } finally {
                    g.plumb.setSuspendDrawing(!1, !0)
                }
            }, this.getTask = function (a) {
                return g.tasks[a]
            };
            var o = function (a) {
                return a.dependencies.endpoints.filter(function (a) {
                    return a.isSource;
                })
            }, p = function (a) {
                return a.dependencies.endpoints.filter(function (a) {
                    return a.isTarget
                })
            };
            this.connect = function (a, b, c) {
                var d = o(a), e = p(b);
                if (d && e) {
                    var f, h;
                    f = c.connectParameters && c.connectParameters.sourceEndpointIndex ? d[c.connectParameters.sourceEndpointIndex] : d[0], h = c.connectParameters && c.connectParameters.targetEndpointIndex ? e[c.connectParameters.targetEndpointIndex] : e[0];
                    var i = g.plumb.connect({source: f, target: h}, c.connectParameters);
                    return i
                }
            }, this.getDependencies = function () {
                var a = [];
                return angular.forEach(this.dependenciesFrom, function (b) {
                    for (var c = 0; c < b.length; c++)b[c]in a || a.push(b[c])
                }), a
            }, this.refresh = function (a) {
                g.plumb.setSuspendDrawing(!0);
                try {
                    var b, c;
                    a && !angular.isArray(a) && (a = [a]), void 0 === a ? (a = this.tasks, b = this.getDependencies()) : (b = [], angular.forEach(a, function (a) {
                        var c = g.getTaskDependencies(a);
                        angular.forEach(c, function (a) {
                            a in b || b.push(a)
                        })
                    }));
                    for (c = 0; c < b.length; c++)g.removeDependency(b[c]);
                    angular.forEach(a, function (a) {
                        g.addDependenciesFromTask(a)
                    })
                } finally {
                    g.plumb.setSuspendDrawing(!1, !0)
                }
            }, this.api.registerMethod("dependencies", "refresh", this.refresh, this)
        };
        return d
    }])
}(), function () {
    "use strict";
    angular.module("gantt.dependencies").factory("GanttDependency", ["ganttUtils", "ganttDom", function (a, b) {
        var c = function (c, d, e) {
            var f = this;
            this.manager = c, this.task = d, this.model = e, this.connection = void 0, this.fallbackEndpoints = [], this.isConnected = function () {
                return !!this.connection
            }, this.disconnect = function () {
                this.connection && (this.connection.endpoints && this.manager.plumb.detach(this.connection), this.connection.$dependency = void 0, this.connection = void 0), this.deleteFallbackEndpoints()
            }, this.deleteFallbackEndpoints = function () {
                if (this.fallbackEndpoints) {
                    for (var a = 0; a < this.fallbackEndpoints.length; a++)f.manager.plumb.deleteEndpoint(this.fallbackEndpoints[a]);
                    this.fallbackEndpoints = []
                }
            }, this.getFromTaskId = function () {
                return void 0 !== this.model.from ? this.model.from : this.task.model.id
            }, this.getToTaskId = function () {
                return void 0 !== this.model.to ? this.model.to : this.task.model.id
            }, this.getFromTask = function () {
                return void 0 !== this.model.from ? this.manager.getTask(this.model.from) : this.task
            }, this.getToTask = function () {
                return void 0 !== this.model.to ? this.manager.getTask(this.model.to) : this.task
            }, this.removeFromTaskModel = function () {
                var b = a.angularIndexOf(this.task.model.dependencies, this.model);
                return b >= 0 && this.task.model.dependencies.splice(b, 1), b
            };
            var g = function (a) {
                if (void 0 === a || void 0 === a.$element)return !1;
                var c = a.$element[0];
                return b.isElementVisible(c)
            };
            this.connect = function () {
                var a = this.getFromTask(), b = this.getToTask();
                if (g(a) || (a = void 0), g(b) || (b = void 0), a && b) {
                    var c = this.manager.connect(a, b, this.model);
                    if (c)return c.$dependency = this, this.connection = c, !0
                }
                if (this.deleteFallbackEndpoints(), void 0 !== a) {
                    var d = this.manager.pluginScope.fallbackEndpoints[1];
                    this.fallbackEndpoints.push(this.manager.plumb.addEndpoint(a.$element, d))
                }
                if (void 0 !== b) {
                    var e = this.manager.pluginScope.fallbackEndpoints[0];
                    this.fallbackEndpoints.push(this.manager.plumb.addEndpoint(b.$element, e))
                }
                return !1
            }
        };
        return c
    }])
}(), function () {
    "use strict";
    angular.module("gantt.dependencies").factory("GanttDependencyTaskMouseHandler", ["$timeout", function (a) {
        var b = function (b, c) {
            var d = this;
            this.manager = b, this.task = c, this.installed = !1, this.elementHandlers = [], this.display = !0, this.hideEndpointsPromise = void 0;
            var e = function (b) {
                this.element = b, this.mouseExitHandler = function () {
                    a.cancel(d.hideEndpointsPromise), d.hideEndpointsPromise = a(d.hideEndpoints, 1e3, !1)
                }, this.mouseEnterHandler = function () {
                    a.cancel(d.hideEndpointsPromise), d.displayEndpoints()
                }, this.install = function () {
                    this.element.bind("mouseenter", this.mouseEnterHandler), this.element.bind("mouseleave", this.mouseExitHandler)
                }, this.release = function () {
                    this.element.unbind("mouseenter", this.mouseEnterHandler), this.element.unbind("mouseleave", this.mouseExitHandler), a.cancel(d.hideEndpointsPromise)
                }
            };
            this.install = function () {
                d.installed || (d.hideEndpoints(), d.task.getContentElement() && (d.elementHandlers.push(new e(d.task.getContentElement())), angular.forEach(d.task.dependencies.endpoints, function (a) {
                    d.elementHandlers.push(new e(angular.element(a.canvas)))
                }), angular.forEach(d.elementHandlers, function (a) {
                    a.install()
                }), d.installed = !0))
            }, this.release = function () {
                d.installed && (angular.forEach(d.elementHandlers, function (a) {
                    a.release()
                }), d.elementHandlers = [], d.displayEndpoints(), d.installed = !1)
            }, this.displayEndpoints = function () {
                d.display = !0, angular.forEach(d.task.dependencies.endpoints, function (a) {
                    a.setVisible(!0, !0, !0)
                })
            }, this.hideEndpoints = function () {
                angular.forEach(d.task.dependencies.endpoints, function (a) {
                    a.setVisible(!1, !0, !0)
                }), d.display = !1
            }
        };
        return b
    }])
}(), function () {
    "use strict";
    angular.module("gantt.groups").controller("GanttGroupController", ["$scope", "GanttTaskGroup", "ganttUtils", function (a, b, c) {
        var d = function () {
            var d = a.row.model.groups;
            "boolean" == typeof d && (d = {enabled: d});
            var e = c.firstProperty([d], "enabled", a.pluginScope.enabled);
            e ? (a.display = c.firstProperty([d], "display", a.pluginScope.display), a.taskGroup = new b(a.row, a.pluginScope), a.row.setFromTo(), a.row.setFromToByValues(a.taskGroup.from, a.taskGroup.to)) : (a.taskGroup = void 0, a.display = void 0)
        };
        a.gantt.api.tasks.on.viewChange(a, function (b) {
            if (void 0 !== a.taskGroup)if (a.taskGroup.tasks.indexOf(b) > -1)d(), a.$$phase || a.$root.$$phase || a.$digest(); else {
                var c = a.pluginScope.hierarchy.descendants(a.row);
                c.indexOf(b.row) > -1 && (d(), a.$$phase || a.$root.$$phase || a.$digest())
            }
        });
        var e = a.pluginScope.$watch("display", d);
        a.$watchCollection("gantt.rowsManager.filteredRows", d), a.gantt.api.columns.on.refresh(a, d), a.$on("$destroy", e)
    }])
}(), function () {
    "use strict";
    angular.module("gantt.groups").directive("ganttTaskGroup", ["GanttDirectiveBuilder", function (a) {
        var b = new a("ganttTaskGroup", "plugins/groups/taskGroup.tmpl.html");
        return b.build()
    }])
}(), function () {
    "use strict";
    angular.module("gantt").factory("GanttTaskGroup", ["ganttUtils", "GanttTask", function (a, b) {
        var c = function (c, d) {
            var e = this;
            e.row = c, e.pluginScope = d, e.descendants = e.pluginScope.hierarchy.descendants(e.row), e.tasks = [], e.overviewTasks = [], e.promotedTasks = [], e.showGrouping = !1;
            var f = e.row.model.groups;
            "boolean" == typeof f && (f = {enabled: f});
            for (var g = function (b) {
                var c = b.model.groups;
                "boolean" == typeof c && (c = {enabled: c});
                var d = b.row.model.groups;
                "boolean" == typeof d && (d = {enabled: d});
                var g = a.firstProperty([c, d, f], "enabled", e.pluginScope.enabled);
                if (g) {
                    var h = a.firstProperty([c, d, f], "display", e.pluginScope.display);
                    return h
                }
            }, h = 0; h < e.descendants.length; h++)for (var i = e.descendants[h].tasks, j = 0; j < i.length; j++) {
                var k = i[j], l = g(k);
                if (void 0 !== l) {
                    e.tasks.push(k);
                    var m = new b(e.row, k.model);
                    "overview" === l ? e.overviewTasks.push(m) : "promote" === l ? e.promotedTasks.push(m) : e.showGrouping = !0
                }
            }
            if (e.from = void 0, f && (e.from = f.from), void 0 === e.from)for (h = 0; h < e.tasks.length; h++)(void 0 === e.from || e.tasks[h].model.from < e.from) && (e.from = e.tasks[h].model.from);
            if (e.to = void 0, f && (e.to = f.to), void 0 === e.to)for (h = 0; h < e.tasks.length; h++)(void 0 === e.to || e.tasks[h].model.to > e.to) && (e.to = e.tasks[h].model.to);
            e.showGrouping && (e.left = c.rowsManager.gantt.getPositionByDate(e.from), e.width = c.rowsManager.gantt.getPositionByDate(e.to) - e.left)
        };
        return c
    }])
}(), function () {
    "use strict";
    angular.module("gantt").directive("ganttTaskOverview", ["GanttDirectiveBuilder", function (a) {
        var b = new a("ganttTaskOverview", "plugins/groups/taskOverview.tmpl.html");
        return b.controller = function (a, b) {
            a.task.$element = b, a.task.$scope = a, a.task.updatePosAndSize()
        }, b.build()
    }])
}(), function () {
    "use strict";
    angular.module("gantt.labels").directive("ganttLabelsBody", ["GanttDirectiveBuilder", "ganttLayout", function (a, b) {
        var c = new a("ganttLabelsBody", "plugins/labels/labelsBody.tmpl.html");
        return c.controller = function (a) {
            var c = b.getScrollBarHeight();
            a.getLabelsCss = function () {
                var b = {};
                if (a.maxHeight) {
                    var d = a.gantt.scroll.isHScrollbarVisible() ? c : 0;
                    b["max-height"] = a.maxHeight - d - a.gantt.header.getHeight() + "px"
                }
                return b
            }
        }, c.build()
    }])
}(), function () {
    "use strict";
    angular.module("gantt.labels").directive("ganttLabelsHeader", ["GanttDirectiveBuilder", function (a) {
        var b = new a("ganttLabelsHeader", "plugins/labels/labelsHeader.tmpl.html");
        return b.build()
    }])
}(), function () {
    "use strict";
    angular.module("gantt.labels").directive("ganttSideContentLabels", ["GanttDirectiveBuilder", function (a) {
        var b = new a("ganttSideContentLabels", "plugins/labels/sideContentLabels.tmpl.html");
        return b.build()
    }])
}(), function () {
    "use strict";
    angular.module("gantt.movable").factory("ganttMovableOptions", [function () {
        return {
            initialize: function (a) {
                return a.enabled = void 0 === a.enabled || a.enabled, a.allowMoving = void 0 === a.allowMoving || !!a.allowMoving, a.allowResizing = void 0 === a.allowResizing || !!a.allowResizing, a.allowRowSwitching = void 0 === a.allowRowSwitching || !!a.allowRowSwitching, a
            }
        }
    }])
}(), function () {
    "use strict";
    angular.module("gantt.progress").directive("ganttTaskProgress", ["$templateCache", function (a) {
        return {
            restrict: "E", requires: "^ganttTask", templateUrl: function (b, c) {
                var d;
                return d = void 0 === c.templateUrl ? "plugins/progress/taskProgress.tmpl.html" : c.templateUrl, void 0 !== c.template && a.put(d, c.template), d
            }, replace: !0, scope: !0, controller: ["$scope", "$element", function (a, b) {
                a.getClasses = function () {
                    var b = [];
                    return "object" == typeof a.task.model.progress && (b = a.task.model.progress.classes), b
                }, a.getCss = function () {
                    var b, c = {};
                    return void 0 !== a.task.model.progress && (b = "object" == typeof a.task.model.progress ? a.task.model.progress : {percent: a.task.model.progress}), b && (b.color ? c["background-color"] = b.color : c["background-color"] = "#6BC443", c.width = b.percent + "%"), c
                }, a.task.rowsManager.gantt.api.directives.raise.new("ganttTaskProgress", a, b), a.$on("$destroy", function () {
                    a.task.rowsManager.gantt.api.directives.raise.destroy("ganttTaskProgress", a, b)
                })
            }]
        }
    }])
}(), function () {
    "use strict";
    angular.module("gantt.table").directive("ganttSideContentTable", ["GanttDirectiveBuilder", "ganttLayout", function (a, b) {
        var c = new a("ganttSideContentTable", "plugins/table/sideContentTable.tmpl.html");
        return c.controller = function (a) {
            var c = b.getScrollBarHeight();
            a.getMaxHeightCss = function () {
                var b = {};
                if (a.maxHeight) {
                    var d = a.gantt.scroll.isHScrollbarVisible() ? c : 0;
                    b["max-height"] = a.maxHeight - d - a.gantt.header.getHeight() + "px"
                }
                return b
            }
        }, c.build()
    }])
}(), function () {
    "use strict";
    angular.module("gantt.table").controller("TableColumnController", ["$scope", function (a) {
        a.getHeader = function () {
            var b = a.pluginScope.headers[a.column];
            return void 0 !== b ? b : (void 0 !== a.pluginScope.headerFormatter && (b = a.pluginScope.headerFormatter(a.column)), void 0 !== b ? b : b)
        }, a.getHeaderContent = function () {
            var b = a.pluginScope.headerContents[a.column];
            return void 0 === b ? "{{getHeader()}}" : b
        }, a.getClass = function () {
            return a.pluginScope.classes[a.column]
        }
    }])
}(), function () {
    "use strict";
    angular.module("gantt.table").controller("TableColumnRowController", ["$scope", "$rootScope", "$location", function (a, b, c) {
        a.getValue = function () {
            var b = a.$eval(a.column, a.row), c = a.pluginScope.formatters[a.column];
            return void 0 !== c && (b = c(b, a.column, a.row)), b
        }, a.getRowContent = function () {
            var b;
            return a.row.model.columnContents && (b = a.row.model.columnContents[a.column]), void 0 === b && "model.name" === a.column && (b = a.row.model.content), void 0 === b && (b = a.pluginScope.contents[a.column]), void 0 === b && "model.name" === a.column && (b = a.row.rowsManager.gantt.options.value("rowContent")), void 0 === b && void 0 !== a.pluginScope.content && (b = a.pluginScope.content), void 0 === b ? "{{getValue()}}" : b
        }, a.showJobChain = function (evn, a, o) {
            if ($(evn.target).attr('class') == 'gantt-label-text') {
                if ($(evn.target).text() == o) {
                    b.$broadcast("order-list",a)
                } else {
                    var x = JSON.parse(sessionStorage.$SOS$scheduleIds).selected
                    c.path('/job_chain').search({path: a, scheduler_id:x });
                }
            }
        }, a.showJob = function (a) {
            var x = JSON.parse(sessionStorage.$SOS$scheduleIds).selected
            c.path('/job').search({path: a, scheduler_id:x });
        }
    }])
}(), function () {
    "use strict";
    angular.module("gantt.tooltips").directive("ganttTooltip", ["$log", "$timeout", "$compile", "$document", "$templateCache", "ganttDebounce", "ganttSmartEvent", function (a, b, c, d, e, f, g) {
        return {
            restrict: "E", templateUrl: function (a, b) {
                var c;
                return c = void 0 === b.templateUrl ? "plugins/tooltips/tooltip.tmpl.html" : b.templateUrl, void 0 !== b.template && e.put(c, b.template), c
            }, scope: !0, replace: !0, controller: ["$scope", "$element", "ganttUtils", function (a, c, e) {
                var h, i, j, k = angular.element(d[0].body), l = a.task.$element, m = !1, n = function () {
                    var a = d[0];
                    return a.documentElement.clientWidth || a.documentElement.getElementById("body")[0].clientWidth
                }, o = function (b) {
                    b + c[0].offsetWidth > n() ? (c.css("left", b + 20 - c[0].offsetWidth + "px"), a.isRightAligned = !0) : (c.css("left", b - 20 + "px"), a.isRightAligned = !1)
                }, p = function (b) {
                    m = !0, j.bind(), a.displayed = !0, a.$evalAsync(function () {
                        var d;
                        c.hasClass("ng-hide") && (c.removeClass("ng-hide"), d = !0), a.elementHeight = c[0].offsetHeight, d && c.addClass("ng-hide"), a.taskRect = l[0].getBoundingClientRect(), o(b)
                    })
                }, q = function () {
                    m = !1, j.unbind(), a.$evalAsync(function () {
                        a.displayed = !1
                    })
                }, r = function (c, d) {
                    h && b.cancel(h);
                    var f = a.task.model.tooltips, g = a.task.row.model.tooltips;
                    "boolean" == typeof f && (f = {enabled: f}), "boolean" == typeof g && (g = {enabled: g});
                    var j = e.firstProperty([f, g], "enabled", a.pluginScope.enabled);
                    j && !m && void 0 !== i && c ? d ? h = b(function () {
                        p(i)
                    }, a.pluginScope.delay, !1) : p(i) : c || a.task.active || q()
                };
                j = g(a, k, "mousemove", f(function (b) {
                    m ? ((!a.taskRect || b.clientX < a.taskRect.left || b.clientX > a.taskRect.right || b.clientY > a.taskRect.bottom || b.clientY < a.taskRect.top) && r(!1, !1), o(b.clientX)) : (i = b.clientX, r(!0, !1))
                }, 5, !1)), a.getFromLabel = function () {
                    var b = a.task.model.tooltips, c = a.task.row.model.tooltips;
                    "boolean" == typeof b && (b = {enabled: b}), "boolean" == typeof c && (c = {enabled: c});
                    var d = e.firstProperty([b, c], "dateFormat", a.pluginScope.dateFormat);
                    return a.task.model.from.format(d)
                }, a.getToLabel = function () {
                    var b = a.task.model.tooltips, c = a.task.row.model.tooltips;
                    "boolean" == typeof b && (b = {enabled: b}), "boolean" == typeof c && (c = {enabled: c});
                    var d = e.firstProperty([b, c], "dateFormat", a.pluginScope.dateFormat);
                    return a.task.model.to.format(d)
                }, a.task.getContentElement().bind("mousemove", function (a) {
                    i = a.clientX
                }), a.task.getContentElement().bind("mouseenter", function (a) {
                    i = a.clientX, r(!0, !0)
                }), a.task.getContentElement().bind("mouseleave", function () {
                    r(!1)
                }), a.pluginScope.api.tasks.on.moveBegin && (a.pluginScope.api.tasks.on.moveBegin(a, function (b) {
                    b === a.task && r(!0)
                }), a.pluginScope.api.tasks.on.moveEnd(a, function (b) {
                    b === a.task && r(!1)
                }), a.pluginScope.api.tasks.on.resizeBegin(a, function (b) {
                    b === a.task && r(!0)
                }), a.pluginScope.api.tasks.on.resizeEnd(a, function (b) {
                    b === a.task && r(!1)
                })), a.task.isMoving && r(!0, !1), a.gantt.api.directives.raise.new("ganttTooltip", a, c), a.$on("$destroy", function () {
                    a.gantt.api.directives.raise.destroy("ganttTooltip", a, c)
                })
            }]
        }
    }])
}(), function () {
    "use strict";
    angular.module("gantt.tree").directive("ganttRowTreeLabel", ["GanttDirectiveBuilder", function (a) {
        var b = new a("ganttRowTreeLabel");
        return b.restrict = "A", b.templateUrl = void 0, b.build()
    }])
}(), function () {
    "use strict";
    angular.module("gantt.tree").directive("ganttSideContentTree", ["GanttDirectiveBuilder", function (a) {
        var b = new a("ganttSideContentTree", "plugins/tree/sideContentTree.tmpl.html");
        return b.build()
    }])
}(), function () {
    "use strict";
    angular.module("gantt.tree").controller("GanttTreeController", ["$scope", "$filter", "GanttHierarchy", function (a, b, c) {
        a.rootRows = [], a.getHeader = function () {
            return a.pluginScope.header
        };
        var d = new c;
        a.pluginScope.$watchGroup(["keepAncestorOnFilterRow", "enabled"], function (c) {
            var e = c[0] && c[1];
            if (e) {
                var f = function (a, c, e) {
                    d.refresh(a);
                    for (var f = [], g = 0; g < a.length; g++) {
                        var h = d.children(a[g]);
                        h && 0 !== h.length || f.push(a[g])
                    }
                    var i = b("filter")(f, c, e), j = function (a) {
                        if (i.indexOf(a) > -1)return !0;
                        for (var b = d.descendants(a), c = 0; c < b.length; c++)if (i.indexOf(b[c]) > -1)return !0;
                        return !1
                    };
                    return b("filter")(a, j, e)
                };
                a.gantt.rowsManager.setFilterImpl(f)
            } else a.gantt.rowsManager.setFilterImpl(!1)
        });
        var e = function (b) {
            for (var c = a.parent(b); void 0 !== c;) {
                if (void 0 !== c && c._collapsed)return !1;
                c = a.parent(c)
            }
            return !0
        }, f = function (a) {
            return a.filter(function (a) {
                return e(a)
            })
        }, g = function (b) {
            for (var c = [], d = [], e = !1, f = 0; f < b.length; f++) {
                var g = a.parent(b[f]);
                void 0 === g ? d.push(b[f]) : e = !0
            }
            var h = function (d) {
                c.push(d);
                var e = a.children(d);
                if (void 0 !== e && e.length > 0)for (var f = e.sort(function (a, c) {
                    return b.indexOf(a) - b.indexOf(c)
                }), g = 0; g < f.length; g++)h(f[g])
            };
            for (f = 0; f < d.length; f++)h(d[f]);
            return c
        };
        a.gantt.api.rows.addRowSorter(g), a.gantt.api.rows.addRowFilter(f), a.$on("$destroy", function () {
            a.gantt.api.rows.removeRowSorter(g), a.gantt.api.rows.removeRowFilter(f)
        });
        var h = function () {
            a.rootRows = d.refresh(a.gantt.rowsManager.filteredRows), a.gantt.rowsManager.filteredRows.length > 0 && (a.gantt.api.rows.sort(), a.gantt.api.rows.refresh())
        };
        a.gantt.api.rows.on.remove(a, h), a.gantt.api.rows.on.add(a, h);
        var i = function (b) {
            var c;
            return c = "string" == typeof b ? a.gantt.rowsManager.rowsMap[b] : b, void 0 === c ? void 0 : void 0 !== c._collapsed && c._collapsed
        }, j = function (b) {
            var c;
            if (c = "string" == typeof b ? a.gantt.rowsManager.rowsMap[b] : b, void 0 !== c) {
                var d = a.nodeScopes[c.model.id];
                d.collapsed && d.toggle()
            }
        }, k = function (b) {
            var c;
            if (c = "string" == typeof b ? a.gantt.rowsManager.rowsMap[b] : b, void 0 !== c) {
                var d = a.nodeScopes[c.model.id];
                d.collapsed || d.toggle()
            }
        }, l = function () {
            return d
        };
        a.getHeaderContent = function () {
            return a.pluginScope.headerContent
        }, a.gantt.api.registerMethod("tree", "refresh", h, this), a.gantt.api.registerMethod("tree", "isCollapsed", i, this), a.gantt.api.registerMethod("tree", "expand", j, this), a.gantt.api.registerMethod("tree", "collapse", k, this), a.gantt.api.registerEvent("tree", "collapsed"), a.gantt.api.registerMethod("tree", "getHierarchy", l, this), a.$watchCollection("gantt.rowsManager.filteredRows", function () {
            h()
        }), a.children = function (b) {
            return void 0 === b ? a.rootRows : d.children(b)
        }, a.parent = function (a) {
            return d.parent(a)
        }, a.nodeScopes = {}
    }]).controller("GanttUiTreeController", ["$scope", function (a) {
        var b = function () {
            a.$broadcast("angular-ui-tree:collapse-all")
        }, c = function () {
            a.$broadcast("angular-ui-tree:expand-all")
        };
        a.gantt.api.registerMethod("tree", "collapseAll", b, a), a.gantt.api.registerMethod("tree", "expandAll", c, a)
    }]).controller("GanttTreeNodeController", ["$scope", function (a) {
        a.$parent.nodeScopes[a.row.model.id] = a, a.$on("$destroy", function () {
            delete a.$parent.nodeScopes[a.row.model.id]
        }), a.$watch("children(row)", function (b) {
            if (b) {
                for (var c = a.row.rowsManager.filteredRows, d = [], e = 0; e < b.length; e++) {
                    var f = b[e];
                    c.indexOf(f) > -1 && d.push(f)
                }
                a.$parent.childrenRows = d
            } else a.$parent.childrenRows = b
        }), a.isCollapseDisabled = function () {
            return !a.$parent.childrenRows || 0 === a.$parent.childrenRows.length
        }, a.getValue = function () {
            return a.row.model.name
        }, a.getRowContent = function () {
            if (void 0 !== a.row.model.content)return a.row.model.content;
            if (void 0 !== a.pluginScope.content)return a.pluginScope.content;
            var b = a.row.rowsManager.gantt.options.value("rowContent");
            return void 0 === b && (b = "{{row.model.name}}"), b
        }, a.$watch("collapsed", function (b) {
            if (a.$modelValue._collapsed !== b) {
                var c = a.$modelValue._collapsed;
                a.$modelValue._collapsed = b, void 0 !== c && b !== c && (a.gantt.api.tree.raise.collapsed(a, a.$modelValue, b), a.gantt.api.rows.refresh())
            }
        })
    }])
}(), function () {
    "use strict";
    angular.module("gantt.tree").directive("ganttTreeBody", ["GanttDirectiveBuilder", "ganttLayout", function (a, b) {
        var c = new a("ganttTreeBody", "plugins/tree/treeBody.tmpl.html");
        return c.controller = function (a) {
            var c = b.getScrollBarHeight();
            a.getLabelsCss = function () {
                var b = {};
                if (a.maxHeight) {
                    var d = a.gantt.scroll.isHScrollbarVisible() ? c : 0;
                    b["max-height"] = a.maxHeight - d - a.gantt.header.getHeight() + "px"
                }
                return b
            }
        }, c.build()
    }])
}(), function () {
    "use strict";
    angular.module("gantt.tree").directive("ganttTreeHeader", ["GanttDirectiveBuilder", function (a) {
        var b = new a("ganttTreeHeader", "plugins/tree/treeHeader.tmpl.html");
        return b.build()
    }])
}(), angular.module("gantt.bounds.templates", []).run(["$templateCache", function (a) {
    a.put("plugins/bounds/taskBounds.tmpl.html", '<div ng-cloak class="gantt-task-bounds" ng-style="getCss()" ng-class="getClass()"></div>\n')
}]), angular.module("gantt.dependencies.templates", []).run(["$templateCache", function (a) {
}]), angular.module("gantt.drawtask.templates", []).run(["$templateCache", function (a) {
}]), angular.module("gantt.groups.templates", []).run(["$templateCache", function (a) {
    a.put("plugins/groups/taskGroup.tmpl.html", '<div ng-controller="GanttGroupController">\n    <div class="gantt-task-group-overview" ng-if="taskGroup.overviewTasks.length > 0">\n        <gantt-task-overview ng-repeat="task in taskGroup.overviewTasks"></gantt-task-overview>\n    </div>\n    <div class="gantt-task-group-promote" ng-if="taskGroup.row._collapsed && taskGroup.promotedTasks.length > 0">\n        <gantt-task ng-repeat="task in taskGroup.promotedTasks"></gantt-task>\n    </div>\n    <div class="gantt-task-group"\n         ng-if="taskGroup.showGrouping"\n         ng-style="{\'left\': taskGroup.left + \'px\', \'width\': taskGroup.width + \'px\'}">\n        <div class="gantt-task-group-left-main"></div>\n        <div class="gantt-task-group-right-main"></div>\n        <div class="gantt-task-group-left-symbol"></div>\n        <div class="gantt-task-group-right-symbol"></div>\n    </div>\n</div>\n\n'), a.put("plugins/groups/taskOverview.tmpl.html", '<div class="gantt-task gantt-task-overview" ng-class="task.model.classes">\n    <gantt-task-background></gantt-task-background>\n    <gantt-task-content></gantt-task-content>\n    <gantt-task-foreground></gantt-task-foreground>\n</div>\n\n')
}]), angular.module("gantt.labels.templates", []).run(["$templateCache", function (a) {
    a.put("plugins/labels/labelsBody.tmpl.html", '<div class="gantt-labels-body" ng-style="getLabelsCss()">\n    <div gantt-vertical-scroll-receiver>\n        <div ng-repeat="row in gantt.rowsManager.visibleRows track by row.model.id">\n  <div gantt-row-label\n                 class="gantt-row-label gantt-row-height"\n                 ng-class="row.model.classes"\n                 ng-style="{\'height\': row.model.height}">\n                <span class="gantt-label-text">{{row.model.name}}</span>\n            </div>\n        </div>\n    </div>\n</div>\n'), a.put("plugins/labels/labelsHeader.tmpl.html", '<div class="gantt-labels-header">\n    <div ng-show="gantt.columnsManager.columns.length > 0 && gantt.columnsManager.headers.length > 0">\n        <div ng-repeat="header in gantt.columnsManager.headers">\n            <div class="gantt-row-height" ng-class="{\'gantt-labels-header-row\': $last, \'gantt-labels-header-row-last\': $last}"><span>{{$last ? pluginScope.header : ""}}</span></div>\n        </div>\n    </div>\n</div>\n'), a.put("plugins/labels/sideContentLabels.tmpl.html", '<div class="gantt-side-content-labels">\n    <gantt-labels-header>\n    </gantt-labels-header>\n    <gantt-labels-body>\n    </gantt-labels-body>\n</div>\n')
}]), angular.module("gantt.movable.templates", []).run(["$templateCache", function (a) {
}]), angular.module("gantt.overlap.templates", []).run(["$templateCache", function (a) {
}]), angular.module("gantt.progress.templates", []).run(["$templateCache", function (a) {
    a.put("plugins/progress/taskProgress.tmpl.html", '<div ng-cloak class="gantt-task-progress" ng-style="getCss()" ng-class="getClasses()"></div>\n')
}]), angular.module("gantt.resizeSensor.templates", []).run(["$templateCache", function (a) {
}]), angular.module("gantt.sortable.templates", []).run(["$templateCache", function (a) {
}]), angular.module("gantt.table.templates", []).run(["$templateCache", function (a) {
    a.put("plugins/table/sideContentTable.tmpl.html", '<div class="gantt-side-content-table">\n\n    <div class="gantt-table-column {{getClass()}}" ng-repeat="column in pluginScope.columns" ng-controller="TableColumnController">\n\n        <div class="gantt-table-header" ng-style="{height: ganttHeaderHeight + \'px\'}">\n            <div ng-show="ganttHeaderHeight" class="gantt-row-label-header gantt-row-label gantt-table-row gantt-table-header-row">\n                <span class="gantt-label-text" gantt-bind-compile-html="getHeaderContent()"/>\n            </div>\n        </div>\n\n        <div class="gantt-table-content" ng-style="getMaxHeightCss()">\n            <div gantt-vertical-scroll-receiver>\n                <div class="gantt-table-row" ng-repeat="row in gantt.rowsManager.visibleRows track by row.model.id" ng-controller="TableColumnRowController">\n                    <div gantt-row-label class="gantt-row-label gantt-row-height" ng-class="row.model.classes" ng-style="{\'height\': row.model.height}">\n                        <div class="gantt-valign-container">\n                            <div class="gantt-valign-content">\n   <a class="text-hover-primary" ng-click="showJobChain($event,row.model.name,row.model.orderId);$event.stopPropagation()" ng-if="row.model.orderId" ><span class="gantt-label-text" gantt-bind-compile-html="getRowContent()"> </span></a> <a class="text-hover-primary" ng-click="showJob(row.model.name);$event.stopPropagation()" ng-if="!row.model.orderId" ><span class="gantt-label-text" gantt-bind-compile-html="getRowContent()"> </span></a>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n\n    </div>\n</div>\n')
}]), angular.module("gantt.tooltips.templates", []).run(["$templateCache", function (a) {
    a.put("plugins/tooltips/tooltip.tmpl.html", '<div ng-cloak\n     class="gantt-task-info"\n     ng-show="displayed"\n     ng-class="isRightAligned ? \'gantt-task-infoArrowR\' : \'gantt-task-infoArrow\'"\n     ng-style="{top: taskRect.top + \'px\', marginTop: -elementHeight - 8 + \'px\'}">\n    <div class="gantt-task-info-content">\n        <div gantt-bind-compile-html="pluginScope.content"></div>\n    </div>\n</div>\n')
}]), angular.module("gantt.tree.templates", []).run(["$templateCache", function (a) {
    a.put("plugins/tree/sideContentTree.tmpl.html", '<div class="gantt-side-content-tree" ng-controller="GanttTreeController">\n    <gantt-tree-header>\n    </gantt-tree-header>\n    <gantt-tree-body>\n    </gantt-tree-body>\n</div>\n'), a.put("plugins/tree/treeBody.tmpl.html", '<div class="gantt-tree-body" ng-style="getLabelsCss()">\n    <div gantt-vertical-scroll-receiver>\n        <div class="gantt-row-label-background">\n            <div class="gantt-row-label gantt-row-height"\n                 ng-class="row.model.classes"\n                 ng-style="{\'height\': row.model.height}"\n                 ng-repeat="row in gantt.rowsManager.visibleRows track by row.model.id">\n                &nbsp;\n            </div>\n        </div>\n        <div ui-tree ng-controller="GanttUiTreeController" data-drag-enabled="false" data-empty-place-holder-enabled="false">\n            <ol class="gantt-tree-root" ui-tree-nodes ng-model="rootRows">\n                <li ng-repeat="row in rootRows" ui-tree-node\n                    ng-include="\'plugins/tree/treeBodyChildren.tmpl.html\'">\n                </li>\n            </ol>\n        </div>\n    </div>\n</div>\n'), a.put("plugins/tree/treeBodyChildren.tmpl.html", '<div ng-controller="GanttTreeNodeController"\n     class="gantt-row-label gantt-row-height"\n     ng-class="row.model.classes"\n     ng-style="{\'height\': row.model.height}">\n    <div class="gantt-valign-container">\n        <div class="gantt-valign-content">\n            <a ng-disabled="isCollapseDisabled()" data-nodrag\n               class="gantt-tree-handle-button btn btn-xs"\n               ng-class="{\'gantt-tree-collapsed\': collapsed, \'gantt-tree-expanded\': !collapsed}"\n               ng-click="!isCollapseDisabled() && toggle()"><span\n                class="gantt-tree-handle glyphicon glyphicon-chevron-down"\n                ng-class="{\n                \'glyphicon-chevron-right fa fa-chevron-right\': collapsed, \'glyphicon glyphicon-chevron-down fa fa-chevron-down\': !collapsed,\n                \'gantt-tree-collapsed\': collapsed, \'gantt-tree-expanded\': !collapsed}"></span>\n            </a>\n            <span gantt-row-label class="gantt-label-text" gantt-bind-compile-html="getRowContent()"/>\n        </div>\n    </div>\n</div>\n<ol ui-tree-nodes ng-class="{hide: collapsed}" ng-model="childrenRows">\n    <li ng-repeat="row in childrenRows" ui-tree-node>\n        <div ng-include="\'plugins/tree/treeBodyChildren.tmpl.html\'"></div>\n    </li>\n</ol>\n'), a.put("plugins/tree/treeHeader.tmpl.html", '<div class="gantt-tree-header" ng-style="{height: $parent.ganttHeaderHeight + \'px\'}">\n    <div ng-if="$parent.ganttHeaderHeight" class="gantt-row-label gantt-row-label-header gantt-tree-row gantt-tree-header-row"><span class="gantt-label-text" gantt-bind-compile-html="getHeaderContent()"/></div>\n</div>\n')
}]);
