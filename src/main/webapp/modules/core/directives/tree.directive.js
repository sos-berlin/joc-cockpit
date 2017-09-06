/**
 * Created by sourabhagrawal on 30/9/16.
 */
(function () {

    angular.module("app")

        .directive("tree", ["$timeout", function (a) {
        return {
            restrict: "E",
            templateUrl: function (a, c) {
                return c.templateUrl
            },
            replace: !0,
            scope: {
                treeData: "=",
                colDefs: "=",
                expandOn: "=",
                onSelect: "&",
                onClick: "&",
                onChoose: "&",
                expandNode: "&",
                collapseNode: "&",
                initialSelection: "@",
                treeControl: "=",
                expandTo: "=",
                filter: "=",
                reverse: "=",
                object: "="
            },
            link: function (b, c, d) {

                var ht = (window.innerHeight - 204);
                $('.max-tree-ht').css('height', ht + 'px');

                var e, f, g, h, i, j, k, l, m, n, o, p;
                if (e = function (a) {
                    }, d.iconExpand = d.iconExpand ? d.iconExpand : "fa fa-plus", d.iconCollapse = d.iconCollapse ? d.iconCollapse : "fa fa-minus", d.iconLeaf = d.iconLeaf ? d.iconLeaf : "icon-file", d.sortedAsc = d.sortedAsc ? d.sortedAsc : "m-t-xs fa fa-caret-up", d.sortedDesc = d.sortedDesc ? d.sortedDesc : "m-t-xs fa fa-caret-down", d.expandLevel = d.expandLevel ? d.expandLevel : "0", h = parseInt(d.expandLevel, 10), !b.treeData)return void alert("No data was defined for the tree, please define treeData!");
                var q = function () {
                    if (d.expandOn)f = b.expandOn, b.expandingProperty = b.expandOn; else if (b.treeData.length) {
                        for (var c = b.treeData[0], e = Object.keys(c), g = 0, h = e.length; g < h; g++)if ("string" == typeof c[e[g]]) {
                            f = e[g];
                            break
                        }
                        f || (f = e[0]), b.expandingProperty = f
                    }
                };
                if (q(), d.colDefs)b.colDefinitions = b.colDefs; else if (b.treeData.length) {
                    var r = [], s = b.treeData[0], t = ["folders", "level", "expanded", "icons", f];
                    for (var u in s)t.indexOf(u) === -1 && r.push({field: u});
                    b.colDefinitions = r
                }
                j = function (a) {
                    var c, d, e, f, g, h;
                    for (c = function (b, d) {
                        var e, f, g, h, i;
                        if (a(b, d), null != b.folders) {
                            for (h = b.folders, i = [], f = 0, g = h.length; f < g; f++)e = h[f], i.push(c(e, d + 1));
                            return i
                        }
                    }, g = b.treeData, h = [], e = 0, f = g.length; e < f; e++)d = g[e], h.push(c(d, 1));
                    return h
                }, o = null, n = function (c) {
                    if (!c)return null != o && (o.selected = !1), void(o = null);
                    if (c !== o) {
                        if (null != o && (o.selected = !1), c.selected = !0, o = c, g(c), null != c.onSelect)return a(function () {
                            return c.onSelect(c)
                        });
                        if (null != b.onSelect)return a(function () {
                            return b.onSelect({branch: c})
                        })
                    }
                }, b.on_user_click = function (a) {
                    b.onClick && b.onClick({branch: a})
                }, b.user_clicks_branch = function (a) {
                    if (a !== o)return n(a)
                },b.sortBy = function (a) {
                    "asc" === a.sortDirection ? (v(b.treeData, a, !0), a.sortDirection = "desc", a.sortingIcon = d.sortedDesc) : (v(b.treeData, a, !1), a.sortDirection = "asc", a.sortingIcon = d.sortedAsc), a.sorted = !0, x(a)
                }, b.on_choose_calendar = function (a) {
                    b.onChoose && b.onChoose({calendar: a})
                };
                var v = function (a, b, c) {
                    a.sort(w(b, c));
                    for (var d = 0; d < a.length; d++)v(a[d].folders, b, c)
                }, w = function (a, b) {
                    var c = b ? -1 : 1;
                    if ("custom" === a.sortingType && "function" == typeof a.sortingFunc)return function (b, d) {
                        return a.sortingFunc(b, d) * c
                    };
                    var d = function (b) {
                        return null === b[a.field] ? "" : b[a.field].toLowerCase()
                    };
                    switch (a.sortingType) {
                        case"number":
                            d = function (b) {
                                return parseFloat(b[a.field])
                            };
                            break;
                        case"date":
                            d = function (b) {
                                return new Date(b[a.field])
                            }
                    }
                    return function (a, b) {
                        return a = d(a), b = d(b), c * ((a > b) - (b > a))
                    }
                }, x = function (a) {
                    if(b)
                    for (var c = b.colDefinitions.length, d = 0; d < c; d++) {
                        var e = b.colDefinitions[d];
                        e.field != a.field && (e.sorted = !1, e.sortDirection = "none")
                    }
                };
                return k = function (a) {
                    var b;
                    return b = void 0, a.parent_uid && j(function (c) {
                        if (c.uid === a.parent_uid)return b = c
                    }), b
                }, i = function (a, b) {
                    var c;
                    if (c = k(a), null != c)return b(c), i(c, b)
                }, g = function (a) {
                    return i(a, function (a) {
                        return a.expanded = !0
                    })
                }, b.tree_rows = [], m = function () {
                    q();
                    var a, c, e, g, i, k;
                    for (j(function (a, b) {
                        if (!a.uid)return a.uid = "" + Math.random()
                    }), j(function (a) {
                        var b, c, d, e, f;
                        if (angular.isArray(a.folders)) {
                            for (e = a.folders, f = [], c = 0, d = e.length; c < d; c++)b = e[c], f.push(b.parent_uid = a.uid);
                            return f
                        }
                    }), b.tree_rows = [], j(function (a) {
                        var b, c;
                        return a.folders ? a.folders.length > 0 ? (c = function (a) {
                            return "string" == typeof a ? {label: a, folders: []} : a
                        }, a.folders = function () {
                            var d, e, f, g;
                            for (f = a.folders, g = [], d = 0, e = f.length; d < e; d++)b = f[d], g.push(c(b));
                            return g
                        }()) : void 0 : a.folders = []
                    }), a = function (c, e, g) {
                        var i, j, k, l, m, n, o;
                        if (null == e.expanded && (e.expanded = !1), k = e.folders && 0 !== e.folders.length ? e.expanded ? e.icons && e.icons.iconCollapse || d.iconCollapse : e.icons && e.icons.iconExpand || d.iconExpand : e.icons && e.icons.iconLeaf || d.iconLeaf, e.level = c, b.tree_rows.push({
                                level: c,
                                branch: e,
                                label: e[f],
                                tree_icon: k,
                                visible: g
                            }), null != e.folders) {
                            for (n = e.folders, o = [], l = 0, m = n.length; l < m; l++)i = n[l], j = g && (e.expanded || e.level < h), o.push(a(c + 1, i, j));
                            return o
                        }
                    }, i = b.treeData, k = [], e = 0, g = i.length; e < g; e++)c = i[e], k.push(a(1, c, !0));
                    return k
                }, b.$watch("treeData", m, !0), on_expandTo_change = function () {
                    angular.isDefined(b.expandTo) && j(function (c) {
                        if (c.expanded = !1, c[f.field] === b.expandTo || c[f] === b.expandTo)return a(function () {
                            return n(c)
                        })
                    })
                }, b.$watch("expandTo", on_expandTo_change, !0), null != d.initialSelection && j(function (b) {
                    if (b.label === d.initialSelection)return a(function () {
                        return n(b)
                    })
                }), l = b.treeData.length, j(function (a, b) {
                    return a.level = b, a.expanded = a.level < h
                }), null != b.treeControl && angular.isObject(b.treeControl) ? (p = b.treeControl, p.expand_all = function () {
                    return j(function (a, b) {
                        return a.expanded = !0
                    })
                }, p.collapse_all = function () {
                    return j(function (a, b) {
                        return a.expanded = !1
                    })
                }, p.get_first_branch = function () {
                    if (l = b.treeData.length, l > 0)return b.treeData[0]
                }, p.select_first_branch = function () {
                    var a;
                    return a = p.get_first_branch(), p.select_branch(a)
                }, p.get_selected_branch = function () {
                    return o
                }, p.get_parent_branch = function (a) {
                    return k(a)
                }, p.select_branch = function (a) {
                    return n(a), a
                }, p.get_folders = function (a) {
                    return a.folders
                }, p.select_parent_branch = function (a) {
                    var b;
                    if (null == a && (a = p.get_selected_branch()), null != a && (b = p.get_parent_branch(a), null != b))return p.select_branch(b), b
                }, p.add_branch = function (a, c) {
                    return null != a ? (a.folders.push(c), a.expanded = !0) : b.treeData.push(c), c
                }, p.add_root_branch = function (a) {
                    return p.add_branch(null, a), a
                }, p.expand_branch = function (a) {
                    if (null == a && (a = p.get_selected_branch()), null != a)return a.expanded = !0, a
                }, p.collapse_branch = function (a) {
                    if (null == a && (a = o), null != a)return a.expanded = !1, a
                }, p.get_siblings = function (a) {
                    var c, d;
                    if (null == a && (a = o), null != a)return c = p.get_parent_branch(a), d = c ? c.folders : b.treeData
                }, p.get_next_sibling = function (a) {
                    var b, c;
                    if (null == a && (a = o), null != a && (c = p.get_siblings(a), l = c.length, b = c.indexOf(a), b < l))return c[b + 1]
                }, p.get_prev_sibling = function (a) {
                    var b, c;
                    if (null == a && (a = o), c = p.get_siblings(a), l = c.length, b = c.indexOf(a), b > 0)return c[b - 1]
                }, p.select_next_sibling = function (a) {
                    var b;
                    if (null == a && (a = o), null != a && (b = p.get_next_sibling(a), null != b))return p.select_branch(b)
                }, p.select_prev_sibling = function (a) {
                    var b;
                    if (null == a && (a = o), null != a && (b = p.get_prev_sibling(a), null != b))return p.select_branch(b)
                }, p.get_first_child = function (a) {
                    var b;
                    if (null == a && (a = o), null != a && (null != (b = a.folders) ? b.length : void 0) > 0)return a.folders[0]
                }, p.get_closest_ancestor_next_sibling = function (a) {
                    var b, c;
                    return b = p.get_next_sibling(a), null != b ? b : (c = p.get_parent_branch(a), p.get_closest_ancestor_next_sibling(c))
                }, p.get_next_branch = function (a) {
                    var b;
                    if (null == a && (a = o), null != a)return b = p.get_first_child(a), null != b ? b : b = p.get_closest_ancestor_next_sibling(a)
                }, p.select_next_branch = function (a) {
                    var b;
                    if (null == a && (a = o), null != a && (b = p.get_next_branch(a), null != b))return p.select_branch(b), b
                }, p.last_descendant = function (a) {
                    var b;
                    return l = a.folders.length, 0 === l ? a : (b = a.folders[l - 1], p.last_descendant(b))
                }, p.get_prev_branch = function (a) {
                    var b, c;
                    if (null == a && (a = o), null != a)return c = p.get_prev_sibling(a), null != c ? p.last_descendant(c) : b = p.get_parent_branch(a)
                }, p.select_prev_branch = function (a) {
                    var b;
                    if (null == a && (a = o), null != a && (b = p.get_prev_branch(a), null != b))return p.select_branch(b), b
                }) : void 0
            }
        }
    }]);
})();
