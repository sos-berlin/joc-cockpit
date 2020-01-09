!function () {
    function e(e) {
        var r = "    ";
        if (isNaN(parseInt(e))) r = e; else switch (e) {
            case 1:
                r = " ";
                break;
            case 2:
                r = "  ";
                break;
            case 3:
                r = "   ";
                break;
            case 4:
                r = "    ";
                break;
            case 5:
                r = "     ";
                break;
            case 6:
                r = "      ";
                break;
            case 7:
                r = "       ";
                break;
            case 8:
                r = "        ";
                break;
            case 9:
                r = "         ";
                break;
            case 10:
                r = "          ";
                break;
            case 11:
                r = "           ";
                break;
            case 12:
                r = "            "
        }
        var c = ["\n"];
        for (ix = 0; ix < 100; ix++) c.push(c[ix] + r);
        return c
    }

    function r() {
        this.step = "    ", this.shift = e(this.step)
    }

    function c(e, r) {
        return r - (e.replace(/\(/g, "").length - e.replace(/\)/g, "").length)
    }

    function a(e, r) {
        return e.replace(/\s{1,}/g, " ").replace(/ AND /gi, "~::~" + r + r + "AND ").replace(/ BETWEEN /gi, "~::~" + r + "BETWEEN ").replace(/ CASE /gi, "~::~" + r + "CASE ").replace(/ ELSE /gi, "~::~" + r + "ELSE ").replace(/ END /gi, "~::~" + r + "END ").replace(/ FROM /gi, "~::~FROM ").replace(/ GROUP\s{1,}BY/gi, "~::~GROUP BY ").replace(/ HAVING /gi, "~::~HAVING ").replace(/ IN /gi, " IN ").replace(/ JOIN /gi, "~::~JOIN ").replace(/ CROSS~::~{1,}JOIN /gi, "~::~CROSS JOIN ").replace(/ INNER~::~{1,}JOIN /gi, "~::~INNER JOIN ").replace(/ LEFT~::~{1,}JOIN /gi, "~::~LEFT JOIN ").replace(/ RIGHT~::~{1,}JOIN /gi, "~::~RIGHT JOIN ").replace(/ ON /gi, "~::~" + r + "ON ").replace(/ OR /gi, "~::~" + r + r + "OR ").replace(/ ORDER\s{1,}BY/gi, "~::~ORDER BY ").replace(/ OVER /gi, "~::~" + r + "OVER ").replace(/\(\s{0,}SELECT /gi, "~::~(SELECT ").replace(/\)\s{0,}SELECT /gi, ")~::~SELECT ").replace(/ THEN /gi, " THEN~::~" + r).replace(/ UNION /gi, "~::~UNION~::~").replace(/ USING /gi, "~::~USING ").replace(/ WHEN /gi, "~::~" + r + "WHEN ").replace(/ WHERE /gi, "~::~WHERE ").replace(/ WITH /gi, "~::~WITH ").replace(/ ALL /gi, " ALL ").replace(/ AS /gi, " AS ").replace(/ ASC /gi, " ASC ").replace(/ DESC /gi, " DESC ").replace(/ DISTINCT /gi, " DISTINCT ").replace(/ EXISTS /gi, " EXISTS ").replace(/ NOT /gi, " NOT ").replace(/ NULL /gi, " NULL ").replace(/ LIKE /gi, " LIKE ").replace(/\s{0,}SELECT /gi, "SELECT ").replace(/\s{0,}UPDATE /gi, "UPDATE ").replace(/ SET /gi, " SET ").replace(/~::~{1,}/g, "~::~").split("~::~")
    }

    r.prototype.xml = function (r, c) {
        var a = r.replace(/>\s{0,}</g, "><").replace(/</g, "~::~<").replace(/\s*xmlns\:/g, "~::~xmlns:").replace(/\s*xmlns\=/g, "~::~xmlns=").split("~::~"),
            s = a.length, p = !1, l = 0, i = "", n = 0, t = c ? e(c) : this.shift;
        for (n = 0; s > n; n++) {
            a[n] && a[n].match(/<!\[CDATA\[.*|(\s|\w|\n|\r)*\]\]>/g) && (a[n - 1] = a[n - 1] + a[n], a.splice(n, 1), s--);
        }    
        for (n = 0; s > n; n++) a[n] && (a[n].search(/<!/) > -1 ? (i += t[l] + a[n], p = !0, (a[n].search(/-->/) > -1 || a[n].search(/\]>/) > -1 || a[n].search(/!DOCTYPE/) > -1) && (p = !1)) : a[n].search(/-->/) > -1 || a[n].search(/\]>/) > -1 ? (i += a[n], p = !1) : /^<\w/.exec(a[n - 1]) && /^<\/\w/.exec(a[n]) && /^<[\w:\-\.\,]+/.exec(a[n - 1]) == /^<\/[\w:\-\.\,]+/.exec(a[n])[0].replace("/", "") ? i += a[n] : a[n].search(/<\w/) > -1 && -1 == a[n].search(/<\//) && -1 == a[n].search(/\/>/) ? i = i += p ? a[n] : t[l++] + a[n] : a[n].search(/<\w/) > -1 && a[n].search(/<\//) > -1 ? i = i += p ? a[n] : t[l] + a[n] : a[n].search(/<\//) > -1 ? i = i += p ? a[n] : t[--l] + a[n] : a[n].search(/\/>/) > -1 ? i = i += p ? a[n] : t[l] + a[n] : i += a[n].search(/<\?/) > -1 ? t[l] + a[n] : a[n].search(/xmlns\:/) > -1 || a[n].search(/xmlns\=/) > -1 ? t[l] + a[n] : a[n]);
        return "\n" == i[0] ? i.slice(1) : i
    }, r.prototype.json = function (e, r) {
        r = r || this.step;
        return "undefined" == typeof JSON ? e : "string" == typeof e ? JSON.stringify(JSON.parse(e), null, r) : "object" == typeof e ? JSON.stringify(e, null, r) : e
    }, r.prototype.css = function (r, c) {
        var a = r.replace(/\s{1,}/g, " ").replace(/\{/g, "{~::~").replace(/\}/g, "~::~}~::~").replace(/\;/g, ";~::~").replace(/\/\*/g, "~::~/*").replace(/\*\//g, "*/~::~").replace(/~::~\s{0,}~::~/g, "~::~").split("~::~"),
            s = a.length, p = 0, l = "", i = 0, n = c ? e(c) : this.shift;
        for (i = 0; s > i; i++) l += /\{/.exec(a[i]) ? n[p++] + a[i] : /\}/.exec(a[i]) ? n[--p] + a[i] : (/\*\\/.exec(a[i]), n[p] + a[i]);
        return l.replace(/^\n{1,}/, "")
    }, r.prototype.sql = function (r, s) {
        var p = r.replace(/\s{1,}/g, " ").replace(/\'/gi, "~::~'").split("~::~"), l = p.length, i = [], n = 0,
            t = this.step, g = 0, E = "", N = 0, o = s ? e(s) : this.shift;
        for (N = 0; l > N; N++) i = N % 2 ? i.concat(p[N]) : i.concat(a(p[N], t));
        for (l = i.length, N = 0; l > N; N++) g = c(i[N], g), /\s{0,}\s{0,}SELECT\s{0,}/.exec(i[N]) && (i[N] = i[N].replace(/\,/g, ",\n" + t + t)), /\s{0,}\s{0,}SET\s{0,}/.exec(i[N]) && (i[N] = i[N].replace(/\,/g, ",\n" + t + t)), /\s{0,}\(\s{0,}SELECT\s{0,}/.exec(i[N]) ? E += o[++n] + i[N] : /\'/.exec(i[N]) ? (1 > g && n && n--, E += i[N]) : (E += o[n] + i[N], 1 > g && n && n--);
        return E.replace(/^\n{1,}/, "").replace(/\n{1,}/g, "\n")
    }, r.prototype.xmlmin = function (e, r) {
        return (r ? e : e.replace(/\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/g, "").replace(/[ \r\n\t]{1,}xmlns/g, " xmlns")).replace(/>\s{0,}</g, "><")
    }, r.prototype.jsonmin = function (e) {
        return "undefined" == typeof JSON ? e : JSON.stringify(JSON.parse(e), null, 0)
    }, r.prototype.cssmin = function (e, r) {
        return (r ? e : e.replace(/\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\//g, "")).replace(/\s{1,}/g, " ").replace(/\{\s{1,}/g, "{").replace(/\}\s{1,}/g, "}").replace(/\;\s{1,}/g, ";").replace(/\/\*\s{1,}/g, "/*").replace(/\*\/\s{1,}/g, "*/")
    }, r.prototype.sqlmin = function (e) {
        return e.replace(/\s{1,}/g, " ").replace(/\s{1,}\(/, "(").replace(/\s{1,}\)/, ")")
    }, window.vkbeautify = new r
}();
