!function (e, t, a, n) {
    function o(t, a) {
        this.element = t, this.settings = e.extend({}, s, a), this._defaults = s, this._name = i, this.init()
    }

    function l(e) {
        return (e.filename ? e.filename : "table2excel") + (e.fileext ? e.fileext : ".xlsx")
    }

    var i = "table2excel", s = {exclude: ".tableexport-ignore", name: "Table2Excel"};
    o.prototype = {
        init: function () {
            var t = this, a = '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">';
            t.template = {
                head: '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' + a + "<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>",
                sheet: {
                    head: "<x:ExcelWorksheet><x:Name>",
                    tail: "</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>"
                },
                mid: "</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>",
                table: {head: "<table>", tail: "</table>"},
                foot: "</body></html>"
            }, t.tableRows = [], e(t.element).each(function (a, n) {
                var o = "", l = e(n).clone();
                l.find(t.settings.exclude).remove(), l.find("tr").each(function (t, a) {
                    o += "<tr>" + e(a).html() + "</tr>"
                }), t.tableRows.push(o)
            }), t.tableToExcel(t.tableRows, t.settings.name, t.settings.sheetName)
        }, tableToExcel: function (n, o, i) {
            var s, r, c, m = this, x = "";
            if (m.uri = "data:application/vnd.ms-excel;base64,", m.base64 = function (e) {
                    return t.btoa(unescape(encodeURIComponent(e)))
                }, m.format = function (e, t) {
                    return e.replace(/{(\w+)}/g, function (e, a) {
                        return t[a]
                    })
                }, i = "undefined" == typeof i ? "Sheet" : i, m.ctx = {
                    worksheet: o || "Worksheet",
                    table: n,
                    sheetName: i
                }, x = m.template.head, e.isArray(n))for (s in n)x += m.template.sheet.head + i + s + m.template.sheet.tail;
            if (x += m.template.mid, e.isArray(n))for (s in n)x += m.template.table.head + "{table" + s + "}" + m.template.table.tail;
            x += m.template.foot;
            for (s in n)m.ctx["table" + s] = n[s];
            if (delete m.ctx.table, "undefined" != typeof msie && msie > 0 || navigator.userAgent.match(/Trident.*rv\:11\./))if ("undefined" != typeof Blob) {
                x = [x];
                var f = new Blob(x, {type: "text/html"});
                t.navigator.msSaveBlob(f, l(m.settings))
            } else txtArea1.document.open("text/html", "replace"), txtArea1.document.write(m.format(x, m.ctx)), txtArea1.document.close(), txtArea1.focus(), sa = txtArea1.document.execCommand("SaveAs", !0, l(m.settings)); else r = m.uri + m.base64(m.format(x, m.ctx)), c = a.createElement("a"), c.download = l(m.settings), c.href = r, a.body.appendChild(c), c.click(), a.body.removeChild(c);
            return !0
        }
    }, e.fn[i] = function (t) {
        var a = this;
        return a.each(function () {
            e.data(a, "plugin_" + i) || e.data(a, "plugin_" + i, new o(this, t))
        }), a
    }
}(jQuery, window, document);
