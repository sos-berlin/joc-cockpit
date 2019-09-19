/*! highlight.js v9.15.10 | BSD3 License | git.io/hljslicense */ ! function(e) {
    var n = "object" == typeof window && window || "object" == typeof self && self;
    "undefined" == typeof exports || exports.nodeType ? n && (n.hljs = e({}), "function" == typeof define && define.amd && define([], function() {
        return n.hljs
    })) : e(exports)
}(function(a) {
    var f = [],
        u = Object.keys,
        N = {},
        c = {},
        n = /^(no-?highlight|plain|text)$/i,
        s = /\blang(?:uage)?-([\w-]+)\b/i,
        t = /((^(<[^>]+>|\t|)+|(?:\n)))/gm,
        r = {
            case_insensitive: "cI",
            lexemes: "l",
            contains: "c",
            keywords: "k",
            subLanguage: "sL",
            className: "cN",
            begin: "b",
            beginKeywords: "bK",
            end: "e",
            endsWithParent: "eW",
            illegal: "i",
            excludeBegin: "eB",
            excludeEnd: "eE",
            returnBegin: "rB",
            returnEnd: "rE",
            relevance: "r",
            variants: "v",
            IDENT_RE: "IR",
            UNDERSCORE_IDENT_RE: "UIR",
            NUMBER_RE: "NR",
            C_NUMBER_RE: "CNR",
            BINARY_NUMBER_RE: "BNR",
            RE_STARTERS_RE: "RSR",
            BACKSLASH_ESCAPE: "BE",
            APOS_STRING_MODE: "ASM",
            QUOTE_STRING_MODE: "QSM",
            PHRASAL_WORDS_MODE: "PWM",
            C_LINE_COMMENT_MODE: "CLCM",
            C_BLOCK_COMMENT_MODE: "CBCM",
            HASH_COMMENT_MODE: "HCM",
            NUMBER_MODE: "NM",
            C_NUMBER_MODE: "CNM",
            BINARY_NUMBER_MODE: "BNM",
            CSS_NUMBER_MODE: "CSSNM",
            REGEXP_MODE: "RM",
            TITLE_MODE: "TM",
            UNDERSCORE_TITLE_MODE: "UTM",
            COMMENT: "C",
            beginRe: "bR",
            endRe: "eR",
            illegalRe: "iR",
            lexemesRe: "lR",
            terminators: "t",
            terminator_end: "tE"
        },
        b = "</span>",
        h = {
            classPrefix: "hljs-",
            tabReplace: null,
            useBR: !1,
            languages: void 0
        };

    function _(e) {
        return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    }

    function E(e) {
        return e.nodeName.toLowerCase()
    }

    function v(e, n) {
        var t = e && e.exec(n);
        return t && 0 === t.index
    }

    function l(e) {
        return n.test(e)
    }

    function g(e) {
        var n, t = {},
            r = Array.prototype.slice.call(arguments, 1);
        for (n in e) t[n] = e[n];
        return r.forEach(function(e) {
            for (n in e) t[n] = e[n]
        }), t
    }

    function R(e) {
        var a = [];
        return function e(n, t) {
            for (var r = n.firstChild; r; r = r.nextSibling) 3 === r.nodeType ? t += r.nodeValue.length : 1 === r.nodeType && (a.push({
                event: "start",
                offset: t,
                node: r
            }), t = e(r, t), E(r).match(/br|hr|img|input/) || a.push({
                event: "stop",
                offset: t,
                node: r
            }));
            return t
        }(e, 0), a
    }

    function i(e) {
        if (r && !e.langApiRestored) {
            for (var n in e.langApiRestored = !0, r) e[n] && (e[r[n]] = e[n]);
            (e.c || []).concat(e.v || []).forEach(i)
        }
    }

    function m(o) {
        function s(e) {
            return e && e.source || e
        }

        function c(e, n) {
            return new RegExp(s(e), "m" + (o.cI ? "i" : "") + (n ? "g" : ""))
        }! function n(t, e) {
            if (!t.compiled) {
                if (t.compiled = !0, t.k = t.k || t.bK, t.k) {
                    function r(t, e) {
                        o.cI && (e = e.toLowerCase()), e.split(" ").forEach(function(e) {
                            var n = e.split("|");
                            a[n[0]] = [t, n[1] ? Number(n[1]) : 1]
                        })
                    }
                    var a = {};
                    "string" == typeof t.k ? r("keyword", t.k) : u(t.k).forEach(function(e) {
                        r(e, t.k[e])
                    }), t.k = a
                }
                t.lR = c(t.l || /\w+/, !0), e && (t.bK && (t.b = "\\b(" + t.bK.split(" ").join("|") + ")\\b"), t.b || (t.b = /\B|\b/), t.bR = c(t.b), t.endSameAsBegin && (t.e = t.b), t.e || t.eW || (t.e = /\B|\b/), t.e && (t.eR = c(t.e)), t.tE = s(t.e) || "", t.eW && e.tE && (t.tE += (t.e ? "|" : "") + e.tE)), t.i && (t.iR = c(t.i)), null == t.r && (t.r = 1), t.c || (t.c = []), t.c = Array.prototype.concat.apply([], t.c.map(function(e) {
                    return function(n) {
                        return n.v && !n.cached_variants && (n.cached_variants = n.v.map(function(e) {
                            return g(n, {
                                v: null
                            }, e)
                        })), n.cached_variants || n.eW && [g(n)] || [n]
                    }("self" === e ? t : e)
                })), t.c.forEach(function(e) {
                    n(e, t)
                }), t.starts && n(t.starts, e);
                var i = t.c.map(function(e) {
                    return e.bK ? "\\.?(?:" + e.b + ")\\.?" : e.b
                }).concat([t.tE, t.i]).map(s).filter(Boolean);
                t.t = i.length ? c(function(e, n) {
                    for (var t = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./, r = 0, a = "", i = 0; i < e.length; i++) {
                        var o = r,
                            c = s(e[i]);
                        for (0 < i && (a += n); 0 < c.length;) {
                            var u = t.exec(c);
                            if (null == u) {
                                a += c;
                                break
                            }
                            a += c.substring(0, u.index), c = c.substring(u.index + u[0].length), "\\" == u[0][0] && u[1] ? a += "\\" + String(Number(u[1]) + o) : (a += u[0], "(" == u[0] && r++)
                        }
                    }
                    return a
                }(i, "|"), !0) : {
                    exec: function() {
                        return null
                    }
                }
            }
        }(o)
    }

    function C(e, n, i, t) {
        function c(e, n, t, r) {
            var a = '<span class="' + (r ? "" : h.classPrefix);
            return e ? (a += e + '">') + n + (t ? "" : b) : n
        }

        function o() {
            E += null != l.sL ? function() {
                var e = "string" == typeof l.sL;
                if (e && !N[l.sL]) return _(g);
                var n = e ? C(l.sL, g, !0, f[l.sL]) : O(g, l.sL.length ? l.sL : void 0);
                return 0 < l.r && (R += n.r), e && (f[l.sL] = n.top), c(n.language, n.value, !1, !0)
            }() : function() {
                var e, n, t, r, a, i, o;
                if (!l.k) return _(g);
                for (r = "", n = 0, l.lR.lastIndex = 0, t = l.lR.exec(g); t;) r += _(g.substring(n, t.index)), a = l, i = t, void 0, o = s.cI ? i[0].toLowerCase() : i[0], (e = a.k.hasOwnProperty(o) && a.k[o]) ? (R += e[1], r += c(e[0], _(t[0]))) : r += _(t[0]), n = l.lR.lastIndex, t = l.lR.exec(g);
                return r + _(g.substr(n))
            }(), g = ""
        }

        function u(e) {
            E += e.cN ? c(e.cN, "", !0) : "", l = Object.create(e, {
                parent: {
                    value: l
                }
            })
        }

        function r(e, n) {
            if (g += e, null == n) return o(), 0;
            var t = function(e, n) {
                var t, r, a;
                for (t = 0, r = n.c.length; t < r; t++)
                    if (v(n.c[t].bR, e)) return n.c[t].endSameAsBegin && (n.c[t].eR = (a = n.c[t].bR.exec(e)[0], new RegExp(a.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "m"))), n.c[t]
            }(n, l);
            if (t) return t.skip ? g += n : (t.eB && (g += n), o(), t.rB || t.eB || (g = n)), u(t), t.rB ? 0 : n.length;
            var r = function e(n, t) {
                if (v(n.eR, t)) {
                    for (; n.endsParent && n.parent;) n = n.parent;
                    return n
                }
                if (n.eW) return e(n.parent, t)
            }(l, n);
            if (r) {
                var a = l;
                for (a.skip ? g += n : (a.rE || a.eE || (g += n), o(), a.eE && (g = n)); l.cN && (E += b), l.skip || l.sL || (R += l.r), (l = l.parent) !== r.parent;);
                return r.starts && (r.endSameAsBegin && (r.starts.eR = r.eR), u(r.starts)), a.rE ? 0 : n.length
            }
            if (function(e, n) {
                    return !i && v(n.iR, e)
                }(n, l)) throw new Error('Illegal lexeme "' + n + '" for mode "' + (l.cN || "<unnamed>") + '"');
            return g += n, n.length || 1
        }
        var s = B(e);
        if (!s) throw new Error('Unknown language: "' + e + '"');
        m(s);
        var a, l = t || s,
            f = {},
            E = "";
        for (a = l; a !== s; a = a.parent) a.cN && (E = c(a.cN, "", !0) + E);
        var g = "",
            R = 0;
        try {
            for (var d, p, M = 0; l.t.lastIndex = M, d = l.t.exec(n);) p = r(n.substring(M, d.index), d[0]), M = d.index + p;
            for (r(n.substr(M)), a = l; a.parent; a = a.parent) a.cN && (E += b);
            return {
                r: R,
                value: E,
                language: e,
                top: l
            }
        } catch (e) {
            if (e.message && -1 !== e.message.indexOf("Illegal")) return {
                r: 0,
                value: _(n)
            };
            throw e
        }
    }

    function O(t, e) {
        e = e || h.languages || u(N);
        var r = {
                r: 0,
                value: _(t)
            },
            a = r;
        return e.filter(B).filter(M).forEach(function(e) {
            var n = C(e, t, !1);
            n.language = e, n.r > a.r && (a = n), n.r > r.r && (a = r, r = n)
        }), a.language && (r.second_best = a), r
    }

    function d(e) {
        return h.tabReplace || h.useBR ? e.replace(t, function(e, n) {
            return h.useBR && "\n" === e ? "<br>" : h.tabReplace ? n.replace(/\t/g, h.tabReplace) : ""
        }) : e
    }

    function o(e) {
        var n, t, r, a, i, o = function(e) {
            var n, t, r, a, i = e.className + " ";
            if (i += e.parentNode ? e.parentNode.className : "", t = s.exec(i)) return B(t[1]) ? t[1] : "no-highlight";
            for (n = 0, r = (i = i.split(/\s+/)).length; n < r; n++)
                if (l(a = i[n]) || B(a)) return a
        }(e);
        l(o) || (h.useBR ? (n = document.createElementNS("http://www.w3.org/1999/xhtml", "div")).innerHTML = e.innerHTML.replace(/\n/g, "").replace(/<br[ \/]*>/g, "\n") : n = e, i = n.textContent, r = o ? C(o, i, !0) : O(i), (t = R(n)).length && ((a = document.createElementNS("http://www.w3.org/1999/xhtml", "div")).innerHTML = r.value, r.value = function(e, n, t) {
            var r = 0,
                a = "",
                i = [];

            function o() {
                return e.length && n.length ? e[0].offset !== n[0].offset ? e[0].offset < n[0].offset ? e : n : "start" === n[0].event ? e : n : e.length ? e : n
            }

            function c(e) {
                a += "<" + E(e) + f.map.call(e.attributes, function(e) {
                    return " " + e.nodeName + '="' + _(e.value).replace('"', "&quot;") + '"'
                }).join("") + ">"
            }

            function u(e) {
                a += "</" + E(e) + ">"
            }

            function s(e) {
                ("start" === e.event ? c : u)(e.node)
            }
            for (; e.length || n.length;) {
                var l = o();
                if (a += _(t.substring(r, l[0].offset)), r = l[0].offset, l === e) {
                    for (i.reverse().forEach(u); s(l.splice(0, 1)[0]), (l = o()) === e && l.length && l[0].offset === r;);
                    i.reverse().forEach(c)
                } else "start" === l[0].event ? i.push(l[0].node) : i.pop(), s(l.splice(0, 1)[0])
            }
            return a + _(t.substr(r))
        }(t, R(a), i)), r.value = d(r.value), e.innerHTML = r.value, e.className = function(e, n, t) {
            var r = n ? c[n] : t,
                a = [e.trim()];
            return e.match(/\bhljs\b/) || a.push("hljs"), -1 === e.indexOf(r) && a.push(r), a.join(" ").trim()
        }(e.className, o, r.language), e.result = {
            language: r.language,
            re: r.r
        }, r.second_best && (e.second_best = {
            language: r.second_best.language,
            re: r.second_best.r
        }))
    }

    function p() {
        if (!p.called) {
            p.called = !0;
            var e = document.querySelectorAll("pre code");
            f.forEach.call(e, o)
        }
    }

    function B(e) {
        return e = (e || "").toLowerCase(), N[e] || N[c[e]]
    }

    function M(e) {
        var n = B(e);
        return n && !n.disableAutodetect
    }
    return a.highlight = C, a.highlightAuto = O, a.fixMarkup = d, a.highlightBlock = o, a.configure = function(e) {
        h = g(h, e)
    }, a.initHighlighting = p, a.initHighlightingOnLoad = function() {
        addEventListener("DOMContentLoaded", p, !1), addEventListener("load", p, !1)
    }, a.registerLanguage = function(n, e) {
        var t = N[n] = e(a);
        i(t), t.aliases && t.aliases.forEach(function(e) {
            c[e] = n
        })
    }, a.listLanguages = function() {
        return u(N)
    }, a.getLanguage = B, a.autoDetection = M, a.inherit = g, a.IR = a.IDENT_RE = "[a-zA-Z]\\w*", a.UIR = a.UNDERSCORE_IDENT_RE = "[a-zA-Z_]\\w*", a.NR = a.NUMBER_RE = "\\b\\d+(\\.\\d+)?", a.CNR = a.C_NUMBER_RE = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)", a.BNR = a.BINARY_NUMBER_RE = "\\b(0b[01]+)", a.RSR = a.RE_STARTERS_RE = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~", a.BE = a.BACKSLASH_ESCAPE = {
        b: "\\\\[\\s\\S]",
        r: 0
    }, a.ASM = a.APOS_STRING_MODE = {
        cN: "string",
        b: "'",
        e: "'",
        i: "\\n",
        c: [a.BE]
    }, a.QSM = a.QUOTE_STRING_MODE = {
        cN: "string",
        b: '"',
        e: '"',
        i: "\\n",
        c: [a.BE]
    }, a.PWM = a.PHRASAL_WORDS_MODE = {
        b: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
    }, a.C = a.COMMENT = function(e, n, t) {
        var r = a.inherit({
            cN: "comment",
            b: e,
            e: n,
            c: []
        }, t || {});
        return r.c.push(a.PWM), r.c.push({
            cN: "doctag",
            b: "(?:TODO|FIXME|NOTE|BUG|XXX):",
            r: 0
        }), r
    }, a.CLCM = a.C_LINE_COMMENT_MODE = a.C("//", "$"), a.CBCM = a.C_BLOCK_COMMENT_MODE = a.C("/\\*", "\\*/"), a.HCM = a.HASH_COMMENT_MODE = a.C("#", "$"), a.NM = a.NUMBER_MODE = {
        cN: "number",
        b: a.NR,
        r: 0
    }, a.CNM = a.C_NUMBER_MODE = {
        cN: "number",
        b: a.CNR,
        r: 0
    }, a.BNM = a.BINARY_NUMBER_MODE = {
        cN: "number",
        b: a.BNR,
        r: 0
    }, a.CSSNM = a.CSS_NUMBER_MODE = {
        cN: "number",
        b: a.NR + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
        r: 0
    }, a.RM = a.REGEXP_MODE = {
        cN: "regexp",
        b: /\//,
        e: /\/[gimuy]*/,
        i: /\n/,
        c: [a.BE, {
            b: /\[/,
            e: /\]/,
            r: 0,
            c: [a.BE]
        }]
    }, a.TM = a.TITLE_MODE = {
        cN: "title",
        b: a.IR,
        r: 0
    }, a.UTM = a.UNDERSCORE_TITLE_MODE = {
        cN: "title",
        b: a.UIR,
        r: 0
    }, a.METHOD_GUARD = {
        b: "\\.\\s*" + a.UIR,
        r: 0
    }, a
});
hljs.registerLanguage("bash", function(e) {
    var t = {
            cN: "variable",
            v: [{
                b: /\$[\w\d#@][\w\d_]*/
            }, {
                b: /\$\{(.*?)}/
            }]
        },
        s = {
            cN: "string",
            b: /"/,
            e: /"/,
            c: [e.BE, t, {
                cN: "variable",
                b: /\$\(/,
                e: /\)/,
                c: [e.BE]
            }]
        };
    return {
        aliases: ["sh", "zsh"],
        l: /\b-?[a-z\._]+\b/,
        k: {
            keyword: "if then else elif fi for while in do done case esac function",
            literal: "true false",
            built_in: "break cd continue eval exec exit export getopts hash pwd readonly return shift test times trap umask unset alias bind builtin caller command declare echo enable help let local logout mapfile printf read readarray source type typeset ulimit unalias set shopt autoload bg bindkey bye cap chdir clone comparguments compcall compctl compdescribe compfiles compgroups compquote comptags comptry compvalues dirs disable disown echotc echoti emulate fc fg float functions getcap getln history integer jobs kill limit log noglob popd print pushd pushln rehash sched setcap setopt stat suspend ttyctl unfunction unhash unlimit unsetopt vared wait whence where which zcompile zformat zftp zle zmodload zparseopts zprof zpty zregexparse zsocket zstyle ztcp",
            _: "-ne -eq -lt -gt -f -d -e -s -l -a"
        },
        c: [{
            cN: "meta",
            b: /^#![^\n]+sh\s*$/,
            r: 10
        }, {
            cN: "function",
            b: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
            rB: !0,
            c: [e.inherit(e.TM, {
                b: /\w[\w\d_]*/
            })],
            r: 0
        }, e.HCM, s, {
            cN: "",
            b: /\\"/
        }, {
            cN: "string",
            b: /'/,
            e: /'/
        }, t]
    }
});
hljs.registerLanguage("shell", function(s) {
    return {
        aliases: ["console"],
        c: [{
            cN: "meta",
            b: "^\\s{0,3}[\\w\\d\\[\\]()@-]*[>%$#]",
            starts: {
                e: "$",
                sL: "bash"
            }
        }]
    }
});
hljs.registerLanguage("powershell", function(e) {
    var t = {
            b: "`[\\s\\S]",
            r: 0
        },
        o = {
            cN: "variable",
            v: [{
                b: /\$[\w\d][\w\d_:]*/
            }]
        },
        r = {
            cN: "string",
            v: [{
                b: /"/,
                e: /"/
            }, {
                b: /@"/,
                e: /^"@/
            }],
            c: [t, o, {
                cN: "variable",
                b: /\$[A-z]/,
                e: /[^A-z]/
            }]
        },
        i = e.inherit(e.C(null, null), {
            v: [{
                b: /#/,
                e: /$/
            }, {
                b: /<#/,
                e: /#>/
            }],
            c: [{
                cN: "doctag",
                v: [{
                    b: /\.(synopsis|description|example|inputs|outputs|notes|link|component|role|functionality)/
                }, {
                    b: /\.(parameter|forwardhelptargetname|forwardhelpcategory|remotehelprunspace|externalhelp)\s+\S+/
                }]
            }]
        });
    return {
        aliases: ["ps"],
        l: /-?[A-z\.\-]+/,
        cI: !0,
        k: {
            keyword: "if else foreach return function do while until elseif begin for trap data dynamicparam end break throw param continue finally in switch exit filter try process catchValidateNoCircleInNodeResources ValidateNodeExclusiveResources ValidateNodeManager ValidateNodeResources ValidateNodeResourceSource ValidateNoNameNodeResources ThrowError IsHiddenResourceIsPatternMatched ",
            built_in: "Add-Computer Add-Content Add-History Add-JobTrigger Add-Member Add-PSSnapin Add-Type Checkpoint-Computer Clear-Content Clear-EventLog Clear-History Clear-Host Clear-Item Clear-ItemProperty Clear-Variable Compare-Object Complete-Transaction Connect-PSSession Connect-WSMan Convert-Path ConvertFrom-Csv ConvertFrom-Json ConvertFrom-SecureString ConvertFrom-StringData ConvertTo-Csv ConvertTo-Html ConvertTo-Json ConvertTo-SecureString ConvertTo-Xml Copy-Item Copy-ItemProperty Debug-Process Disable-ComputerRestore Disable-JobTrigger Disable-PSBreakpoint Disable-PSRemoting Disable-PSSessionConfiguration Disable-WSManCredSSP Disconnect-PSSession Disconnect-WSMan Disable-ScheduledJob Enable-ComputerRestore Enable-JobTrigger Enable-PSBreakpoint Enable-PSRemoting Enable-PSSessionConfiguration Enable-ScheduledJob Enable-WSManCredSSP Enter-PSSession Exit-PSSession Export-Alias Export-Clixml Export-Console Export-Counter Export-Csv Export-FormatData Export-ModuleMember Export-PSSession ForEach-Object Format-Custom Format-List Format-Table Format-Wide Get-Acl Get-Alias Get-AuthenticodeSignature Get-ChildItem Get-Command Get-ComputerRestorePoint Get-Content Get-ControlPanelItem Get-Counter Get-Credential Get-Culture Get-Date Get-Event Get-EventLog Get-EventSubscriber Get-ExecutionPolicy Get-FormatData Get-Host Get-HotFix Get-Help Get-History Get-IseSnippet Get-Item Get-ItemProperty Get-Job Get-JobTrigger Get-Location Get-Member Get-Module Get-PfxCertificate Get-Process Get-PSBreakpoint Get-PSCallStack Get-PSDrive Get-PSProvider Get-PSSession Get-PSSessionConfiguration Get-PSSnapin Get-Random Get-ScheduledJob Get-ScheduledJobOption Get-Service Get-TraceSource Get-Transaction Get-TypeData Get-UICulture Get-Unique Get-Variable Get-Verb Get-WinEvent Get-WmiObject Get-WSManCredSSP Get-WSManInstance Group-Object Import-Alias Import-Clixml Import-Counter Import-Csv Import-IseSnippet Import-LocalizedData Import-PSSession Import-Module Invoke-AsWorkflow Invoke-Command Invoke-Expression Invoke-History Invoke-Item Invoke-RestMethod Invoke-WebRequest Invoke-WmiMethod Invoke-WSManAction Join-Path Limit-EventLog Measure-Command Measure-Object Move-Item Move-ItemProperty New-Alias New-Event New-EventLog New-IseSnippet New-Item New-ItemProperty New-JobTrigger New-Object New-Module New-ModuleManifest New-PSDrive New-PSSession New-PSSessionConfigurationFile New-PSSessionOption New-PSTransportOption New-PSWorkflowExecutionOption New-PSWorkflowSession New-ScheduledJobOption New-Service New-TimeSpan New-Variable New-WebServiceProxy New-WinEvent New-WSManInstance New-WSManSessionOption Out-Default Out-File Out-GridView Out-Host Out-Null Out-Printer Out-String Pop-Location Push-Location Read-Host Receive-Job Register-EngineEvent Register-ObjectEvent Register-PSSessionConfiguration Register-ScheduledJob Register-WmiEvent Remove-Computer Remove-Event Remove-EventLog Remove-Item Remove-ItemProperty Remove-Job Remove-JobTrigger Remove-Module Remove-PSBreakpoint Remove-PSDrive Remove-PSSession Remove-PSSnapin Remove-TypeData Remove-Variable Remove-WmiObject Remove-WSManInstance Rename-Computer Rename-Item Rename-ItemProperty Reset-ComputerMachinePassword Resolve-Path Restart-Computer Restart-Service Restore-Computer Resume-Job Resume-Service Save-Help Select-Object Select-String Select-Xml Send-MailMessage Set-Acl Set-Alias Set-AuthenticodeSignature Set-Content Set-Date Set-ExecutionPolicy Set-Item Set-ItemProperty Set-JobTrigger Set-Location Set-PSBreakpoint Set-PSDebug Set-PSSessionConfiguration Set-ScheduledJob Set-ScheduledJobOption Set-Service Set-StrictMode Set-TraceSource Set-Variable Set-WmiInstance Set-WSManInstance Set-WSManQuickConfig Show-Command Show-ControlPanelItem Show-EventLog Sort-Object Split-Path Start-Job Start-Process Start-Service Start-Sleep Start-Transaction Start-Transcript Stop-Computer Stop-Job Stop-Process Stop-Service Stop-Transcript Suspend-Job Suspend-Service Tee-Object Test-ComputerSecureChannel Test-Connection Test-ModuleManifest Test-Path Test-PSSessionConfigurationFile Trace-Command Unblock-File Undo-Transaction Unregister-Event Unregister-PSSessionConfiguration Unregister-ScheduledJob Update-FormatData Update-Help Update-List Update-TypeData Use-Transaction Wait-Event Wait-Job Wait-Process Where-Object Write-Debug Write-Error Write-EventLog Write-Host Write-Output Write-Progress Write-Verbose Write-Warning Add-MDTPersistentDrive Disable-MDTMonitorService Enable-MDTMonitorService Get-MDTDeploymentShareStatistics Get-MDTMonitorData Get-MDTOperatingSystemCatalog Get-MDTPersistentDrive Import-MDTApplication Import-MDTDriver Import-MDTOperatingSystem Import-MDTPackage Import-MDTTaskSequence New-MDTDatabase Remove-MDTMonitorData Remove-MDTPersistentDrive Restore-MDTPersistentDrive Set-MDTMonitorData Test-MDTDeploymentShare Test-MDTMonitorData Update-MDTDatabaseSchema Update-MDTDeploymentShare Update-MDTLinkedDS Update-MDTMedia Add-VamtProductKey Export-VamtData Find-VamtManagedMachine Get-VamtConfirmationId Get-VamtProduct Get-VamtProductKey Import-VamtData Initialize-VamtData Install-VamtConfirmationId Install-VamtProductActivation Install-VamtProductKey Update-VamtProduct Add-CIDatastore Add-KeyManagementServer Add-NodeKeys Add-NsxDynamicCriteria Add-NsxDynamicMemberSet Add-NsxEdgeInterfaceAddress Add-NsxFirewallExclusionListMember Add-NsxFirewallRuleMember Add-NsxIpSetMember Add-NsxLicense Add-NsxLoadBalancerPoolMember Add-NsxLoadBalancerVip Add-NsxSecondaryManager Add-NsxSecurityGroupMember Add-NsxSecurityPolicyRule Add-NsxSecurityPolicyRuleGroup Add-NsxSecurityPolicyRuleService Add-NsxServiceGroupMember Add-NsxTransportZoneMember Add-PassthroughDevice Add-VDSwitchPhysicalNetworkAdapter Add-VDSwitchVMHost Add-VMHost Add-VMHostNtpServer Add-VirtualSwitchPhysicalNetworkAdapter Add-XmlElement Add-vRACustomForm Add-vRAPrincipalToTenantRole Add-vRAReservationNetwork Add-vRAReservationStorage Clear-NsxEdgeInterface Clear-NsxManagerTimeSettings Compress-Archive Connect-CIServer Connect-CisServer Connect-HCXServer Connect-NIServer Connect-NsxLogicalSwitch Connect-NsxServer Connect-NsxtServer Connect-SrmServer Connect-VIServer Connect-Vmc Connect-vRAServer Connect-vRNIServer ConvertFrom-Markdown ConvertTo-MOFInstance Copy-DatastoreItem Copy-HardDisk Copy-NsxEdge Copy-VDisk Copy-VMGuestFile Debug-Runspace Disable-NsxEdgeSsh Disable-RunspaceDebug Disable-vRNIDataSource Disconnect-CIServer Disconnect-CisServer Disconnect-HCXServer Disconnect-NsxLogicalSwitch Disconnect-NsxServer Disconnect-NsxtServer Disconnect-SrmServer Disconnect-VIServer Disconnect-Vmc Disconnect-vRAServer Disconnect-vRNIServer Dismount-Tools Enable-NsxEdgeSsh Enable-RunspaceDebug Enable-vRNIDataSource Expand-Archive Export-NsxObject Export-SpbmStoragePolicy Export-VApp Export-VDPortGroup Export-VDSwitch Export-VMHostProfile Export-vRAIcon Export-vRAPackage Find-Command Find-DscResource Find-Module Find-NsxWhereVMUsed Find-Package Find-PackageProvider Find-RoleCapability Find-Script Format-Hex Format-VMHostDiskPartition Format-XML Generate-VersionInfo Get-AdvancedSetting Get-AlarmAction Get-AlarmActionTrigger Get-AlarmDefinition Get-Annotation Get-CDDrive Get-CIAccessControlRule Get-CIDatastore Get-CINetworkAdapter Get-CIRole Get-CIUser Get-CIVApp Get-CIVAppNetwork Get-CIVAppStartRule Get-CIVAppTemplate Get-CIVM Get-CIVMTemplate Get-CIView Get-Catalog Get-CisCommand Get-CisService Get-CloudCommand Get-Cluster Get-CompatibleVersionAddtionaPropertiesStr Get-ComplexResourceQualifier Get-ConfigurationErrorCount Get-ContentLibraryItem Get-CustomAttribute Get-DSCResourceModules Get-Datacenter Get-Datastore Get-DatastoreCluster Get-DrsClusterGroup Get-DrsRecommendation Get-DrsRule Get-DrsVMHostRule Get-DscResource Get-EdgeGateway Get-EncryptedPassword Get-ErrorReport Get-EsxCli Get-EsxTop Get-ExternalNetwork Get-FileHash Get-FloppyDrive Get-Folder Get-HAPrimaryVMHost Get-HCXAppliance Get-HCXApplianceCompute Get-HCXApplianceDVS Get-HCXApplianceDatastore Get-HCXApplianceNetwork Get-HCXContainer Get-HCXDatastore Get-HCXGateway Get-HCXInterconnectStatus Get-HCXJob Get-HCXMigration Get-HCXNetwork Get-HCXNetworkExtension Get-HCXReplication Get-HCXReplicationSnapshot Get-HCXService Get-HCXSite Get-HCXSitePairing Get-HCXVM Get-HardDisk Get-IScsiHbaTarget Get-InnerMostErrorRecord Get-InstallPath Get-InstalledModule Get-InstalledScript Get-Inventory Get-ItemPropertyValue Get-KeyManagementServer Get-KmipClientCertificate Get-KmsCluster Get-Log Get-LogType Get-MarkdownOption Get-Media Get-MofInstanceName Get-MofInstanceText Get-NetworkAdapter Get-NetworkPool Get-NfsUser Get-NicTeamingPolicy Get-NsxApplicableMember Get-NsxApplicableSecurityAction Get-NsxBackingDVSwitch Get-NsxBackingPortGroup Get-NsxCliDfwAddrSet Get-NsxCliDfwFilter Get-NsxCliDfwRule Get-NsxClusterStatus Get-NsxController Get-NsxDynamicCriteria Get-NsxDynamicMemberSet Get-NsxEdge Get-NsxEdgeBgp Get-NsxEdgeBgpNeighbour Get-NsxEdgeCertificate Get-NsxEdgeCsr Get-NsxEdgeFirewall Get-NsxEdgeFirewallRule Get-NsxEdgeInterface Get-NsxEdgeInterfaceAddress Get-NsxEdgeNat Get-NsxEdgeNatRule Get-NsxEdgeOspf Get-NsxEdgeOspfArea Get-NsxEdgeOspfInterface Get-NsxEdgePrefix Get-NsxEdgeRedistributionRule Get-NsxEdgeRouting Get-NsxEdgeStaticRoute Get-NsxEdgeSubInterface Get-NsxFirewallExclusionListMember Get-NsxFirewallGlobalConfiguration Get-NsxFirewallPublishStatus Get-NsxFirewallRule Get-NsxFirewallRuleMember Get-NsxFirewallSavedConfiguration Get-NsxFirewallSection Get-NsxFirewallThreshold Get-NsxIpPool Get-NsxIpSet Get-NsxLicense Get-NsxLoadBalancer Get-NsxLoadBalancerApplicationProfile Get-NsxLoadBalancerApplicationRule Get-NsxLoadBalancerMonitor Get-NsxLoadBalancerPool Get-NsxLoadBalancerPoolMember Get-NsxLoadBalancerStats Get-NsxLoadBalancerVip Get-NsxLogicalRouter Get-NsxLogicalRouterBgp Get-NsxLogicalRouterBgpNeighbour Get-NsxLogicalRouterBridge Get-NsxLogicalRouterBridging Get-NsxLogicalRouterInterface Get-NsxLogicalRouterOspf Get-NsxLogicalRouterOspfArea Get-NsxLogicalRouterOspfInterface Get-NsxLogicalRouterPrefix Get-NsxLogicalRouterRedistributionRule Get-NsxLogicalRouterRouting Get-NsxLogicalRouterStaticRoute Get-NsxLogicalSwitch Get-NsxMacSet Get-NsxManagerBackup Get-NsxManagerCertificate Get-NsxManagerComponentSummary Get-NsxManagerNetwork Get-NsxManagerRole Get-NsxManagerSsoConfig Get-NsxManagerSyncStatus Get-NsxManagerSyslogServer Get-NsxManagerSystemSummary Get-NsxManagerTimeSettings Get-NsxManagerVcenterConfig Get-NsxSecondaryManager Get-NsxSecurityGroup Get-NsxSecurityGroupEffectiveIpAddress Get-NsxSecurityGroupEffectiveMacAddress Get-NsxSecurityGroupEffectiveMember Get-NsxSecurityGroupEffectiveVirtualMachine Get-NsxSecurityGroupEffectiveVnic Get-NsxSecurityGroupMemberTypes Get-NsxSecurityPolicy Get-NsxSecurityPolicyHighestUsedPrecedence Get-NsxSecurityPolicyRule Get-NsxSecurityTag Get-NsxSecurityTagAssignment Get-NsxSegmentIdRange Get-NsxService Get-NsxServiceDefinition Get-NsxServiceGroup Get-NsxServiceGroupMember Get-NsxServiceProfile Get-NsxSpoofguardNic Get-NsxSpoofguardPolicy Get-NsxSslVpn Get-NsxSslVpnAuthServer Get-NsxSslVpnClientInstallationPackage Get-NsxSslVpnIpPool Get-NsxSslVpnPrivateNetwork Get-NsxSslVpnUser Get-NsxTransportZone Get-NsxUserRole Get-NsxVdsContext Get-NsxtPolicyService Get-NsxtService Get-OSCustomizationNicMapping Get-OSCustomizationSpec Get-Org Get-OrgNetwork Get-OrgVdc Get-OrgVdcNetwork Get-OvfConfiguration Get-PSCurrentConfigurationNode Get-PSDefaultConfigurationDocument Get-PSMetaConfigDocumentInstVersionInfo Get-PSMetaConfigurationProcessed Get-PSReadLineKeyHandler Get-PSReadLineOption Get-PSRepository Get-PSTopConfigurationName Get-PSVersion Get-Package Get-PackageProvider Get-PackageSource Get-PassthroughDevice Get-PositionInfo Get-PowerCLICommunity Get-PowerCLIConfiguration Get-PowerCLIHelp Get-PowerCLIVersion Get-PowerNsxVersion Get-ProviderVdc Get-PublicKeyFromFile Get-PublicKeyFromStore Get-ResourcePool Get-Runspace Get-RunspaceDebug Get-ScsiController Get-ScsiLun Get-ScsiLunPath Get-SecurityInfo Get-SecurityPolicy Get-Snapshot Get-SpbmCapability Get-SpbmCompatibleStorage Get-SpbmEntityConfiguration Get-SpbmFaultDomain Get-SpbmPointInTimeReplica Get-SpbmReplicationGroup Get-SpbmReplicationPair Get-SpbmStoragePolicy Get-Stat Get-StatInterval Get-StatType Get-Tag Get-TagAssignment Get-TagCategory Get-Task Get-Template Get-TimeZone Get-Uptime Get-UsbDevice Get-VAIOFilter Get-VApp Get-VDBlockedPolicy Get-VDPort Get-VDPortgroup Get-VDPortgroupOverridePolicy Get-VDSecurityPolicy Get-VDSwitch Get-VDSwitchPrivateVlan Get-VDTrafficShapingPolicy Get-VDUplinkLacpPolicy Get-VDUplinkTeamingPolicy Get-VDisk Get-VIAccount Get-VICommand Get-VICredentialStoreItem Get-VIEvent Get-VIObjectByVIView Get-VIPermission Get-VIPrivilege Get-VIProperty Get-VIRole Get-VM Get-VMGuest Get-VMHost Get-VMHostAccount Get-VMHostAdvancedConfiguration Get-VMHostAuthentication Get-VMHostAvailableTimeZone Get-VMHostDiagnosticPartition Get-VMHostDisk Get-VMHostDiskPartition Get-VMHostFirewallDefaultPolicy Get-VMHostFirewallException Get-VMHostFirmware Get-VMHostHardware Get-VMHostHba Get-VMHostModule Get-VMHostNetwork Get-VMHostNetworkAdapter Get-VMHostNtpServer Get-VMHostPatch Get-VMHostPciDevice Get-VMHostProfile Get-VMHostProfileImageCacheConfiguration Get-VMHostProfileRequiredInput Get-VMHostProfileStorageDeviceConfiguration Get-VMHostProfileUserConfiguration Get-VMHostProfileVmPortGroupConfiguration Get-VMHostRoute Get-VMHostService Get-VMHostSnmp Get-VMHostStartPolicy Get-VMHostStorage Get-VMHostSysLogServer Get-VMQuestion Get-VMResourceConfiguration Get-VMStartPolicy Get-VTpm Get-VTpmCSR Get-VTpmCertificate Get-VasaProvider Get-VasaStorageArray Get-View Get-VirtualPortGroup Get-VirtualSwitch Get-VmcSddcNetworkService Get-VmcService Get-VsanClusterConfiguration Get-VsanComponent Get-VsanDisk Get-VsanDiskGroup Get-VsanEvacuationPlan Get-VsanFaultDomain Get-VsanIscsiInitiatorGroup Get-VsanIscsiInitiatorGroupTargetAssociation Get-VsanIscsiLun Get-VsanIscsiTarget Get-VsanObject Get-VsanResyncingComponent Get-VsanRuntimeInfo Get-VsanSpaceUsage Get-VsanStat Get-VsanView Get-vRAApplianceServiceStatus Get-vRAAuthorizationRole Get-vRABlueprint Get-vRABusinessGroup Get-vRACatalogItem Get-vRACatalogItemRequestTemplate Get-vRACatalogPrincipal Get-vRAComponentRegistryService Get-vRAComponentRegistryServiceEndpoint Get-vRAComponentRegistryServiceStatus Get-vRAContent Get-vRAContentData Get-vRAContentType Get-vRACustomForm Get-vRAEntitledCatalogItem Get-vRAEntitledService Get-vRAEntitlement Get-vRAExternalNetworkProfile Get-vRAGroupPrincipal Get-vRAIcon Get-vRANATNetworkProfile Get-vRANetworkProfileIPAddressList Get-vRANetworkProfileIPRangeSummary Get-vRAPackage Get-vRAPackageContent Get-vRAPropertyDefinition Get-vRAPropertyGroup Get-vRARequest Get-vRARequestDetail Get-vRAReservation Get-vRAReservationComputeResource Get-vRAReservationComputeResourceMemory Get-vRAReservationComputeResourceNetwork Get-vRAReservationComputeResourceResourcePool Get-vRAReservationComputeResourceStorage Get-vRAReservationPolicy Get-vRAReservationTemplate Get-vRAReservationType Get-vRAResource Get-vRAResourceAction Get-vRAResourceActionRequestTemplate Get-vRAResourceMetric Get-vRAResourceOperation Get-vRAResourceType Get-vRARoutedNetworkProfile Get-vRAService Get-vRAServiceBlueprint Get-vRASourceMachine Get-vRAStorageReservationPolicy Get-vRATenant Get-vRATenantDirectory Get-vRATenantDirectoryStatus Get-vRATenantRole Get-vRAUserPrincipal Get-vRAUserPrincipalGroupMembership Get-vRAVersion Get-vRNIAPIVersion Get-vRNIApplication Get-vRNIApplicationTier Get-vRNIDataSource Get-vRNIDataSourceSNMPConfig Get-vRNIDatastore Get-vRNIDistributedSwitch Get-vRNIDistributedSwitchPortGroup Get-vRNIEntity Get-vRNIEntityName Get-vRNIFirewallRule Get-vRNIFlow Get-vRNIHost Get-vRNIHostVMKNic Get-vRNIIPSet Get-vRNIL2Network Get-vRNINSXManager Get-vRNINodes Get-vRNIProblem Get-vRNIRecommendedRules Get-vRNIRecommendedRulesNsxBundle Get-vRNISecurityGroup Get-vRNISecurityTag Get-vRNIService Get-vRNIServiceGroup Get-vRNIVM Get-vRNIVMvNIC Get-vRNIvCenter Get-vRNIvCenterCluster Get-vRNIvCenterDatacenter Get-vRNIvCenterFolder Grant-NsxSpoofguardNicApproval Import-CIVApp Import-CIVAppTemplate Import-NsxObject Import-PackageProvider Import-PowerShellDataFile Import-SpbmStoragePolicy Import-VApp Import-VMHostProfile Import-vRAContentData Import-vRAIcon Import-vRAPackage Initialize-ConfigurationRuntimeState Install-Module Install-NsxCluster Install-Package Install-PackageProvider Install-Script Install-VMHostPatch Invoke-DrsRecommendation Invoke-NsxCli Invoke-NsxClusterResolveAll Invoke-NsxManagerSync Invoke-NsxRestMethod Invoke-NsxWebRequest Invoke-VMHostProfile Invoke-VMScript Invoke-XpathQuery Invoke-vRADataCollection Invoke-vRARestMethod Invoke-vRATenantDirectorySync Invoke-vRNIRestMethod Join-String Mount-Tools Move-Cluster Move-Datacenter Move-Datastore Move-Folder Move-HardDisk Move-Inventory Move-NsxSecurityPolicyRule Move-ResourcePool Move-Template Move-VApp Move-VDisk Move-VM Move-VMHost New-AdvancedSetting New-AlarmAction New-AlarmActionTrigger New-CDDrive New-CIAccessControlRule New-CIVApp New-CIVAppNetwork New-CIVAppTemplate New-CIVM New-Cluster New-CustomAttribute New-Datacenter New-Datastore New-DatastoreCluster New-DatastoreDrive New-DrsClusterGroup New-DrsRule New-DrsVMHostRule New-DscChecksum New-FloppyDrive New-Folder New-Guid New-HCXAppliance New-HCXMigration New-HCXNetworkExtension New-HCXNetworkMapping New-HCXReplication New-HCXSitePairing New-HCXStaticRoute New-HardDisk New-IScsiHbaTarget New-KmipClientCertificate New-NetworkAdapter New-NfsUser New-NsxAddressSpec New-NsxClusterVxlanConfig New-NsxController New-NsxDynamicCriteriaSpec New-NsxEdge New-NsxEdgeBgpNeighbour New-NsxEdgeCsr New-NsxEdgeFirewallRule New-NsxEdgeInterfaceSpec New-NsxEdgeNatRule New-NsxEdgeOspfArea New-NsxEdgeOspfInterface New-NsxEdgePrefix New-NsxEdgeRedistributionRule New-NsxEdgeSelfSignedCertificate New-NsxEdgeStaticRoute New-NsxEdgeSubInterface New-NsxEdgeSubInterfaceSpec New-NsxFirewallRule New-NsxFirewallSavedConfiguration New-NsxFirewallSection New-NsxIpPool New-NsxIpSet New-NsxLoadBalancerApplicationProfile New-NsxLoadBalancerApplicationRule New-NsxLoadBalancerMemberSpec New-NsxLoadBalancerMonitor New-NsxLoadBalancerPool New-NsxLogicalRouter New-NsxLogicalRouterBgpNeighbour New-NsxLogicalRouterBridge New-NsxLogicalRouterInterface New-NsxLogicalRouterInterfaceSpec New-NsxLogicalRouterOspfArea New-NsxLogicalRouterOspfInterface New-NsxLogicalRouterPrefix New-NsxLogicalRouterRedistributionRule New-NsxLogicalRouterStaticRoute New-NsxLogicalSwitch New-NsxMacSet New-NsxManager New-NsxSecurityGroup New-NsxSecurityPolicy New-NsxSecurityPolicyAssignment New-NsxSecurityPolicyFirewallRuleSpec New-NsxSecurityPolicyGuestIntrospectionSpec New-NsxSecurityPolicyNetworkIntrospectionSpec New-NsxSecurityTag New-NsxSecurityTagAssignment New-NsxSegmentIdRange New-NsxService New-NsxServiceGroup New-NsxSpoofguardPolicy New-NsxSslVpnAuthServer New-NsxSslVpnClientInstallationPackage New-NsxSslVpnIpPool New-NsxSslVpnPrivateNetwork New-NsxSslVpnUser New-NsxTransportZone New-NsxVdsContext New-OSCustomizationNicMapping New-OSCustomizationSpec New-Org New-OrgNetwork New-OrgVdc New-OrgVdcNetwork New-ResourcePool New-ScriptFileInfo New-ScsiController New-Snapshot New-SpbmRule New-SpbmRuleSet New-SpbmStoragePolicy New-StatInterval New-Tag New-TagAssignment New-TagCategory New-Template New-TemporaryFile New-VAIOFilter New-VApp New-VDPortgroup New-VDSwitch New-VDSwitchPrivateVlan New-VDisk New-VICredentialStoreItem New-VIInventoryDrive New-VIPermission New-VIProperty New-VIRole New-VISamlSecurityContext New-VM New-VMHostAccount New-VMHostNetworkAdapter New-VMHostProfile New-VMHostProfileVmPortGroupConfiguration New-VMHostRoute New-VTpm New-VasaProvider New-VcsOAuthSecurityContext New-VirtualPortGroup New-VirtualSwitch New-VsanDisk New-VsanDiskGroup New-VsanFaultDomain New-VsanIscsiInitiatorGroup New-VsanIscsiInitiatorGroupTargetAssociation New-VsanIscsiLun New-VsanIscsiTarget New-vRABusinessGroup New-vRAEntitlement New-vRAExternalNetworkProfile New-vRAGroupPrincipal New-vRANATNetworkProfile New-vRANetworkProfileIPRangeDefinition New-vRAPackage New-vRAPropertyDefinition New-vRAPropertyGroup New-vRAReservation New-vRAReservationNetworkDefinition New-vRAReservationPolicy New-vRAReservationStorageDefinition New-vRARoutedNetworkProfile New-vRAService New-vRAStorageReservationPolicy New-vRATenant New-vRATenantDirectory New-vRAUserPrincipal New-vRNIApplication New-vRNIApplicationTier New-vRNIDataSource Open-VMConsoleWindow Publish-Module Publish-NsxSpoofguardPolicy Publish-Script Register-PSRepository Register-PackageSource Remove-AdvancedSetting Remove-AlarmAction Remove-AlarmActionTrigger Remove-Alias Remove-CDDrive Remove-CIAccessControlRule Remove-CIVApp Remove-CIVAppNetwork Remove-CIVAppTemplate Remove-Cluster Remove-CustomAttribute Remove-Datacenter Remove-Datastore Remove-DatastoreCluster Remove-DrsClusterGroup Remove-DrsRule Remove-DrsVMHostRule Remove-FloppyDrive Remove-Folder Remove-HCXAppliance Remove-HCXNetworkExtension Remove-HCXReplication Remove-HCXSitePairing Remove-HardDisk Remove-IScsiHbaTarget Remove-Inventory Remove-KeyManagementServer Remove-NetworkAdapter Remove-NfsUser Remove-NsxCluster Remove-NsxClusterVxlanConfig Remove-NsxController Remove-NsxDynamicCriteria Remove-NsxDynamicMemberSet Remove-NsxEdge Remove-NsxEdgeBgpNeighbour Remove-NsxEdgeCertificate Remove-NsxEdgeCsr Remove-NsxEdgeFirewallRule Remove-NsxEdgeInterfaceAddress Remove-NsxEdgeNatRule Remove-NsxEdgeOspfArea Remove-NsxEdgeOspfInterface Remove-NsxEdgePrefix Remove-NsxEdgeRedistributionRule Remove-NsxEdgeStaticRoute Remove-NsxEdgeSubInterface Remove-NsxFirewallExclusionListMember Remove-NsxFirewallRule Remove-NsxFirewallRuleMember Remove-NsxFirewallSavedConfiguration Remove-NsxFirewallSection Remove-NsxIpPool Remove-NsxIpSet Remove-NsxIpSetMember Remove-NsxLoadBalancerApplicationProfile Remove-NsxLoadBalancerMonitor Remove-NsxLoadBalancerPool Remove-NsxLoadBalancerPoolMember Remove-NsxLoadBalancerVip Remove-NsxLogicalRouter Remove-NsxLogicalRouterBgpNeighbour Remove-NsxLogicalRouterBridge Remove-NsxLogicalRouterInterface Remove-NsxLogicalRouterOspfArea Remove-NsxLogicalRouterOspfInterface Remove-NsxLogicalRouterPrefix Remove-NsxLogicalRouterRedistributionRule Remove-NsxLogicalRouterStaticRoute Remove-NsxLogicalSwitch Remove-NsxMacSet Remove-NsxSecondaryManager Remove-NsxSecurityGroup Remove-NsxSecurityGroupMember Remove-NsxSecurityPolicy Remove-NsxSecurityPolicyAssignment Remove-NsxSecurityPolicyRule Remove-NsxSecurityPolicyRuleGroup Remove-NsxSecurityPolicyRuleService Remove-NsxSecurityTag Remove-NsxSecurityTagAssignment Remove-NsxSegmentIdRange Remove-NsxService Remove-NsxServiceGroup Remove-NsxSpoofguardPolicy Remove-NsxSslVpnClientInstallationPackage Remove-NsxSslVpnIpPool Remove-NsxSslVpnPrivateNetwork Remove-NsxSslVpnUser Remove-NsxTransportZone Remove-NsxTransportZoneMember Remove-NsxVdsContext Remove-OSCustomizationNicMapping Remove-OSCustomizationSpec Remove-Org Remove-OrgNetwork Remove-OrgVdc Remove-OrgVdcNetwork Remove-PSReadLineKeyHandler Remove-PassthroughDevice Remove-ResourcePool Remove-Snapshot Remove-SpbmStoragePolicy Remove-StatInterval Remove-Tag Remove-TagAssignment Remove-TagCategory Remove-Template Remove-UsbDevice Remove-VAIOFilter Remove-VApp Remove-VDPortGroup Remove-VDSwitch Remove-VDSwitchPhysicalNetworkAdapter Remove-VDSwitchPrivateVlan Remove-VDSwitchVMHost Remove-VDisk Remove-VICredentialStoreItem Remove-VIPermission Remove-VIProperty Remove-VIRole Remove-VM Remove-VMHost Remove-VMHostAccount Remove-VMHostNetworkAdapter Remove-VMHostNtpServer Remove-VMHostProfile Remove-VMHostProfileVmPortGroupConfiguration Remove-VMHostRoute Remove-VTpm Remove-VasaProvider Remove-VirtualPortGroup Remove-VirtualSwitch Remove-VirtualSwitchPhysicalNetworkAdapter Remove-VsanDisk Remove-VsanDiskGroup Remove-VsanFaultDomain Remove-VsanIscsiInitiatorGroup Remove-VsanIscsiInitiatorGroupTargetAssociation Remove-VsanIscsiLun Remove-VsanIscsiTarget Remove-vRABusinessGroup Remove-vRACustomForm Remove-vRAExternalNetworkProfile Remove-vRAGroupPrincipal Remove-vRAIcon Remove-vRANATNetworkProfile Remove-vRAPackage Remove-vRAPrincipalFromTenantRole Remove-vRAPropertyDefinition Remove-vRAPropertyGroup Remove-vRAReservation Remove-vRAReservationNetwork Remove-vRAReservationPolicy Remove-vRAReservationStorage Remove-vRARoutedNetworkProfile Remove-vRAService Remove-vRAStorageReservationPolicy Remove-vRATenant Remove-vRATenantDirectory Remove-vRAUserPrincipal Remove-vRNIApplication Remove-vRNIApplicationTier Remove-vRNIDataSource Repair-NsxEdge Repair-VsanObject Request-vRACatalogItem Request-vRAResourceAction Restart-CIVApp Restart-CIVAppGuest Restart-CIVM Restart-CIVMGuest Restart-VM Restart-VMGuest Restart-VMHost Restart-VMHostService Resume-HCXReplication Revoke-NsxSpoofguardNicApproval Save-Module Save-Package Save-Script Search-Cloud Set-AdvancedSetting Set-AlarmDefinition Set-Annotation Set-CDDrive Set-CIAccessControlRule Set-CINetworkAdapter Set-CIVApp Set-CIVAppNetwork Set-CIVAppStartRule Set-CIVAppTemplate Set-Cluster Set-CustomAttribute Set-Datacenter Set-Datastore Set-DatastoreCluster Set-DrsClusterGroup Set-DrsRule Set-DrsVMHostRule Set-FloppyDrive Set-Folder Set-HCXAppliance Set-HCXMigration Set-HCXReplication Set-HardDisk Set-IScsiHbaTarget Set-KeyManagementServer Set-KmsCluster Set-MarkdownOption Set-NetworkAdapter Set-NfsUser Set-NicTeamingPolicy Set-NodeExclusiveResources Set-NodeManager Set-NodeResourceSource Set-NodeResources Set-NsxEdge Set-NsxEdgeBgp Set-NsxEdgeFirewall Set-NsxEdgeInterface Set-NsxEdgeNat Set-NsxEdgeOspf Set-NsxEdgeRouting Set-NsxFirewallGlobalConfiguration Set-NsxFirewallRule Set-NsxFirewallSavedConfiguration Set-NsxFirewallThreshold Set-NsxLoadBalancer Set-NsxLoadBalancerPoolMember Set-NsxLogicalRouter Set-NsxLogicalRouterBgp Set-NsxLogicalRouterBridging Set-NsxLogicalRouterInterface Set-NsxLogicalRouterOspf Set-NsxLogicalRouterRouting Set-NsxManager Set-NsxManagerRole Set-NsxManagerTimeSettings Set-NsxSecurityPolicy Set-NsxSecurityPolicyFirewallRule Set-NsxSslVpn Set-OSCustomizationNicMapping Set-OSCustomizationSpec Set-Org Set-OrgNetwork Set-OrgVdc Set-OrgVdcNetwork Set-PSCurrentConfigurationNode Set-PSDefaultConfigurationDocument Set-PSMetaConfigDocInsProcessedBeforeMeta Set-PSMetaConfigVersionInfoV2 Set-PSReadLineKeyHandler Set-PSReadLineOption Set-PSRepository Set-PSTopConfigurationName Set-PackageSource Set-PowerCLIConfiguration Set-ResourcePool Set-ScsiController Set-ScsiLun Set-ScsiLunPath Set-SecurityPolicy Set-Snapshot Set-SpbmEntityConfiguration Set-SpbmStoragePolicy Set-StatInterval Set-Tag Set-TagCategory Set-Template Set-VAIOFilter Set-VApp Set-VDBlockedPolicy Set-VDPort Set-VDPortgroup Set-VDPortgroupOverridePolicy Set-VDSecurityPolicy Set-VDSwitch Set-VDTrafficShapingPolicy Set-VDUplinkLacpPolicy Set-VDUplinkTeamingPolicy Set-VDVlanConfiguration Set-VDisk Set-VIPermission Set-VIRole Set-VM Set-VMHost Set-VMHostAccount Set-VMHostAdvancedConfiguration Set-VMHostAuthentication Set-VMHostDiagnosticPartition Set-VMHostFirewallDefaultPolicy Set-VMHostFirewallException Set-VMHostFirmware Set-VMHostHba Set-VMHostModule Set-VMHostNetwork Set-VMHostNetworkAdapter Set-VMHostProfile Set-VMHostProfileImageCacheConfiguration Set-VMHostProfileStorageDeviceConfiguration Set-VMHostProfileUserConfiguration Set-VMHostProfileVmPortGroupConfiguration Set-VMHostRoute Set-VMHostService Set-VMHostSnmp Set-VMHostStartPolicy Set-VMHostStorage Set-VMHostSysLogServer Set-VMQuestion Set-VMResourceConfiguration Set-VMStartPolicy Set-VTpm Set-VirtualPortGroup Set-VirtualSwitch Set-VsanClusterConfiguration Set-VsanFaultDomain Set-VsanIscsiInitiatorGroup Set-VsanIscsiLun Set-VsanIscsiTarget Set-vRABusinessGroup Set-vRACatalogItem Set-vRACustomForm Set-vRAEntitlement Set-vRAExternalNetworkProfile Set-vRANATNetworkProfile Set-vRAReservation Set-vRAReservationNetwork Set-vRAReservationPolicy Set-vRAReservationStorage Set-vRARoutedNetworkProfile Set-vRAService Set-vRAStorageReservationPolicy Set-vRATenant Set-vRATenantDirectory Set-vRAUserPrincipal Set-vRNIDataSourceSNMPConfig Show-Markdown Start-CIVApp Start-CIVM Start-HCXMigration Start-HCXReplication Start-SpbmReplicationFailover Start-SpbmReplicationPrepareFailover Start-SpbmReplicationPromote Start-SpbmReplicationReverse Start-SpbmReplicationTestFailover Start-ThreadJob Start-VApp Start-VM Start-VMHost Start-VMHostService Start-VsanClusterDiskUpdate Start-VsanClusterRebalance Start-VsanEncryptionConfiguration Stop-CIVApp Stop-CIVAppGuest Stop-CIVM Stop-CIVMGuest Stop-SpbmReplicationTestFailover Stop-Task Stop-VApp Stop-VM Stop-VMGuest Stop-VMHost Stop-VMHostService Stop-VsanClusterRebalance Suspend-CIVApp Suspend-CIVM Suspend-HCXReplication Suspend-VM Suspend-VMGuest Suspend-VMHost Sync-SpbmReplicationGroup Test-ConflictingResources Test-HCXMigration Test-HCXReplication Test-Json Test-ModuleReloadRequired Test-MofInstanceText Test-NodeManager Test-NodeResourceSource Test-NodeResources Test-ScriptFileInfo Test-VMHostProfileCompliance Test-VMHostSnmp Test-VsanClusterHealth Test-VsanNetworkPerformance Test-VsanStoragePerformance Test-VsanVMCreation Test-vRAPackage Uninstall-Module Uninstall-Package Uninstall-Script Unlock-VM Unregister-PSRepository Unregister-PackageSource Update-ConfigurationDocumentRef Update-ConfigurationErrorCount Update-DependsOn Update-LocalConfigManager Update-Module Update-ModuleManifest Update-ModuleVersion Update-PowerNsx Update-Script Update-ScriptFileInfo Update-Tools Update-VsanHclDatabase ValidateUpdate-ConfigurationData Wait-Debugger Wait-NsxControllerJob Wait-NsxGenericJob Wait-NsxJob Wait-Task Wait-Tools Write-Information Write-Log Write-MetaConfigFile Write-NodeMOFFile",
            nomarkup: "-ne -eq -lt -gt -ge -le -not -like -notlike -match -notmatch -contains -notcontains -in -notin -replace"
        },
        c: [t, e.NM, r, {
            cN: "string",
            v: [{
                b: /'/,
                e: /'/
            }, {
                b: /@'/,
                e: /^'@/
            }]
        }, {
            cN: "literal",
            b: /\$(null|true|false)\b/
        }, o, i]
    }
});
hljs.registerLanguage("vbscript", function(e) {
    return {
        aliases: ["vbs"],
        cI: !0,
        k: {
            keyword: "call class const dim do loop erase execute executeglobal exit for each next function if then else on error option explicit new private property let get public randomize redim rem select case set stop sub while wend with end to elseif is or xor and not class_initialize class_terminate default preserve in me byval byref step resume goto",
            built_in: "lcase month vartype instrrev ubound setlocale getobject rgb getref string weekdayname rnd dateadd monthname now day minute isarray cbool round formatcurrency conversions csng timevalue second year space abs clng timeserial fixs len asc isempty maths dateserial atn timer isobject filter weekday datevalue ccur isdate instr datediff formatdatetime replace isnull right sgn array snumeric log cdbl hex chr lbound msgbox ucase getlocale cos cdate cbyte rtrim join hour oct typename trim strcomp int createobject loadpicture tan formatnumber mid scriptenginebuildversion scriptengine split scriptengineminorversion cint sin datepart ltrim sqr scriptenginemajorversion time derived eval date formatpercent exp inputbox left ascw chrw regexp server response request cstr err",
            literal: "true false null nothing empty"
        },
        i: "//",
        c: [e.inherit(e.QSM, {
            c: [{
                b: '""'
            }]
        }), e.C(/'/, /$/, {
            r: 0
        }), e.CNM]
    }
});
hljs.registerLanguage("perl", function(e) {
    var t = "getpwent getservent quotemeta msgrcv scalar kill dbmclose undef lc ma syswrite tr send umask sysopen shmwrite vec qx utime local oct semctl localtime readpipe do return format read sprintf dbmopen pop getpgrp not getpwnam rewinddir qqfileno qw endprotoent wait sethostent bless s|0 opendir continue each sleep endgrent shutdown dump chomp connect getsockname die socketpair close flock exists index shmgetsub for endpwent redo lstat msgctl setpgrp abs exit select print ref gethostbyaddr unshift fcntl syscall goto getnetbyaddr join gmtime symlink semget splice x|0 getpeername recv log setsockopt cos last reverse gethostbyname getgrnam study formline endhostent times chop length gethostent getnetent pack getprotoent getservbyname rand mkdir pos chmod y|0 substr endnetent printf next open msgsnd readdir use unlink getsockopt getpriority rindex wantarray hex system getservbyport endservent int chr untie rmdir prototype tell listen fork shmread ucfirst setprotoent else sysseek link getgrgid shmctl waitpid unpack getnetbyname reset chdir grep split require caller lcfirst until warn while values shift telldir getpwuid my getprotobynumber delete and sort uc defined srand accept package seekdir getprotobyname semop our rename seek if q|0 chroot sysread setpwent no crypt getc chown sqrt write setnetent setpriority foreach tie sin msgget map stat getlogin unless elsif truncate exec keys glob tied closedirioctl socket readlink eval xor readline binmode setservent eof ord bind alarm pipe atan2 getgrent exp time push setgrent gt lt or ne m|0 break given say state when",
        r = {
            cN: "subst",
            b: "[$@]\\{",
            e: "\\}",
            k: t
        },
        s = {
            b: "->{",
            e: "}"
        },
        n = {
            v: [{
                b: /\$\d/
            }, {
                b: /[\$%@](\^\w\b|#\w+(::\w+)*|{\w+}|\w+(::\w*)*)/
            }, {
                b: /[\$%@][^\s\w{]/,
                r: 0
            }]
        },
        i = [e.BE, r, n],
        o = [n, e.HCM, e.C("^\\=\\w", "\\=cut", {
            eW: !0
        }), s, {
            cN: "string",
            c: i,
            v: [{
                b: "q[qwxr]?\\s*\\(",
                e: "\\)",
                r: 5
            }, {
                b: "q[qwxr]?\\s*\\[",
                e: "\\]",
                r: 5
            }, {
                b: "q[qwxr]?\\s*\\{",
                e: "\\}",
                r: 5
            }, {
                b: "q[qwxr]?\\s*\\|",
                e: "\\|",
                r: 5
            }, {
                b: "q[qwxr]?\\s*\\<",
                e: "\\>",
                r: 5
            }, {
                b: "qw\\s+q",
                e: "q",
                r: 5
            }, {
                b: "'",
                e: "'",
                c: [e.BE]
            }, {
                b: '"',
                e: '"'
            }, {
                b: "`",
                e: "`",
                c: [e.BE]
            }, {
                b: "{\\w+}",
                c: [],
                r: 0
            }, {
                b: "-?\\w+\\s*\\=\\>",
                c: [],
                r: 0
            }]
        }, {
            cN: "number",
            b: "(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b",
            r: 0
        }, {
            b: "(\\/\\/|" + e.RSR + "|\\b(split|return|print|reverse|grep)\\b)\\s*",
            k: "split return print reverse grep",
            r: 0,
            c: [e.HCM, {
                cN: "regexp",
                b: "(s|tr|y)/(\\\\.|[^/])*/(\\\\.|[^/])*/[a-z]*",
                r: 10
            }, {
                cN: "regexp",
                b: "(m|qr)?/",
                e: "/[a-z]*",
                c: [e.BE],
                r: 0
            }]
        }, {
            cN: "function",
            bK: "sub",
            e: "(\\s*\\(.*?\\))?[;{]",
            eE: !0,
            r: 5,
            c: [e.TM]
        }, {
            b: "-\\w\\b",
            r: 0
        }, {
            b: "^__DATA__$",
            e: "^__END__$",
            sL: "mojolicious",
            c: [{
                b: "^@@.*",
                e: "$",
                cN: "comment"
            }]
        }];
    return r.c = o, {
        aliases: ["pl", "pm"],
        l: /[\w\.]+/,
        k: t,
        c: s.c = o
    }
});
hljs.registerLanguage("javascript", function(e) {
    var r = "[A-Za-z$_][0-9A-Za-z$_]*",
        t = {
            keyword: "in of if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const export super debugger as async await static import from as",
            literal: "true false null undefined NaN Infinity",
            built_in: "eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect Promise"
        },
        a = {
            cN: "number",
            v: [{
                b: "\\b(0[bB][01]+)"
            }, {
                b: "\\b(0[oO][0-7]+)"
            }, {
                b: e.CNR
            }],
            r: 0
        },
        s = {
            cN: "subst",
            b: "\\$\\{",
            e: "\\}",
            k: t,
            c: []
        },
        c = {
            b: "html`",
            e: "",
            starts: {
                e: "`",
                rE: !1,
                c: [e.BE, s],
                sL: "xml"
            }
        },
        n = {
            b: "css`",
            e: "",
            starts: {
                e: "`",
                rE: !1,
                c: [e.BE, s],
                sL: "css"
            }
        },
        o = {
            cN: "string",
            b: "`",
            e: "`",
            c: [e.BE, s]
        };
    s.c = [e.ASM, e.QSM, c, n, o, a, e.RM];
    var i = s.c.concat([e.CBCM, e.CLCM]);
    return {
        aliases: ["js", "jsx"],
        k: t,
        c: [{
            cN: "meta",
            r: 10,
            b: /^\s*['"]use (strict|asm)['"]/
        }, {
            cN: "meta",
            b: /^#!/,
            e: /$/
        }, e.ASM, e.QSM, c, n, o, e.CLCM, e.CBCM, a, {
            b: /[{,]\s*/,
            r: 0,
            c: [{
                b: r + "\\s*:",
                rB: !0,
                r: 0,
                c: [{
                    cN: "attr",
                    b: r,
                    r: 0
                }]
            }]
        }, {
            b: "(" + e.RSR + "|\\b(case|return|throw)\\b)\\s*",
            k: "return throw case",
            c: [e.CLCM, e.CBCM, e.RM, {
                cN: "function",
                b: "(\\(.*?\\)|" + r + ")\\s*=>",
                rB: !0,
                e: "\\s*=>",
                c: [{
                    cN: "params",
                    v: [{
                        b: r
                    }, {
                        b: /\(\s*\)/
                    }, {
                        b: /\(/,
                        e: /\)/,
                        eB: !0,
                        eE: !0,
                        k: t,
                        c: i
                    }]
                }]
            }, {
                cN: "",
                b: /\s/,
                e: /\s*/,
                skip: !0
            }, {
                b: /</,
                e: /(\/[A-Za-z0-9\\._:-]+|[A-Za-z0-9\\._:-]+\/)>/,
                sL: "xml",
                c: [{
                    b: /<[A-Za-z0-9\\._:-]+\s*\/>/,
                    skip: !0
                }, {
                    b: /<[A-Za-z0-9\\._:-]+/,
                    e: /(\/[A-Za-z0-9\\._:-]+|[A-Za-z0-9\\._:-]+\/)>/,
                    skip: !0,
                    c: [{
                        b: /<[A-Za-z0-9\\._:-]+\s*\/>/,
                        skip: !0
                    }, "self"]
                }]
            }],
            r: 0
        }, {
            cN: "function",
            bK: "function",
            e: /\{/,
            eE: !0,
            c: [e.inherit(e.TM, {
                b: r
            }), {
                cN: "params",
                b: /\(/,
                e: /\)/,
                eB: !0,
                eE: !0,
                c: i
            }],
            i: /\[|%/
        }, {
            b: /\$[(.]/
        }, e.METHOD_GUARD, {
            cN: "class",
            bK: "class",
            e: /[{;=]/,
            eE: !0,
            i: /[:"\[\]]/,
            c: [{
                bK: "extends"
            }, e.UTM]
        }, {
            bK: "constructor get set",
            e: /\{/,
            eE: !0
        }],
        i: /#(?!!)/
    }
});
hljs.registerLanguage("java", function(e) {
    var a = "false synchronized int abstract float private char boolean var static null if const for true while long strictfp finally protected import native final void enum else break transient catch instanceof byte super volatile case assert short package default double public try this switch continue throws protected public private module requires exports do",
        t = {
            cN: "number",
            b: "\\b(0[bB]([01]+[01_]+[01]+|[01]+)|0[xX]([a-fA-F0-9]+[a-fA-F0-9_]+[a-fA-F0-9]+|[a-fA-F0-9]+)|(([\\d]+[\\d_]+[\\d]+|[\\d]+)(\\.([\\d]+[\\d_]+[\\d]+|[\\d]+))?|\\.([\\d]+[\\d_]+[\\d]+|[\\d]+))([eE][-+]?\\d+)?)[lLfF]?",
            r: 0
        };
    return {
        aliases: ["jsp"],
        k: a,
        i: /<\/|#/,
        c: [e.C("/\\*\\*", "\\*/", {
            r: 0,
            c: [{
                b: /\w+@/,
                r: 0
            }, {
                cN: "doctag",
                b: "@[A-Za-z]+"
            }]
        }), e.CLCM, e.CBCM, e.ASM, e.QSM, {
            cN: "class",
            bK: "class interface",
            e: /[{;=]/,
            eE: !0,
            k: "class interface",
            i: /[:"\[\]]/,
            c: [{
                bK: "extends implements"
            }, e.UTM]
        }, {
            bK: "new throw return else",
            r: 0
        }, {
            cN: "function",
            b: "([À-ʸa-zA-Z_$][À-ʸa-zA-Z_$0-9]*(<[À-ʸa-zA-Z_$][À-ʸa-zA-Z_$0-9]*(\\s*,\\s*[À-ʸa-zA-Z_$][À-ʸa-zA-Z_$0-9]*)*>)?\\s+)+" + e.UIR + "\\s*\\(",
            rB: !0,
            e: /[{;=]/,
            eE: !0,
            k: a,
            c: [{
                b: e.UIR + "\\s*\\(",
                rB: !0,
                r: 0,
                c: [e.UTM]
            }, {
                cN: "params",
                b: /\(/,
                e: /\)/,
                k: a,
                r: 0,
                c: [e.ASM, e.QSM, e.CNM, e.CBCM]
            }, e.CLCM, e.CBCM]
        }, t, {
            cN: "meta",
            b: "@[A-Za-z]+"
        }]
    }
});
hljs.registerLanguage("vbnet", function(e) {
    return {
        aliases: ["vb"],
        cI: !0,
        k: {
            keyword: "addhandler addressof alias and andalso aggregate ansi as assembly auto binary by byref byval call case catch class compare const continue custom declare default delegate dim distinct do each equals else elseif end enum erase error event exit explicit finally for friend from function get global goto group handles if implements imports in inherits interface into is isfalse isnot istrue join key let lib like loop me mid mod module mustinherit mustoverride mybase myclass namespace narrowing new next not notinheritable notoverridable of off on operator option optional or order orelse overloads overridable overrides paramarray partial preserve private property protected public raiseevent readonly redim rem removehandler resume return select set shadows shared skip static step stop structure strict sub synclock take text then throw to try unicode until using when where while widening with withevents writeonly xor",
            built_in: "boolean byte cbool cbyte cchar cdate cdec cdbl char cint clng cobj csbyte cshort csng cstr ctype date decimal directcast double gettype getxmlnamespace iif integer long object sbyte short single string trycast typeof uinteger ulong ushort",
            literal: "true false nothing"
        },
        i: "//|{|}|endif|gosub|variant|wend|^\\$ ",
        c: [e.inherit(e.QSM, {
            c: [{
                b: '""'
            }]
        }), e.C("'", "$", {
            rB: !0,
            c: [{
                cN: "doctag",
                b: "'''|\x3c!--|--\x3e",
                c: [e.PWM]
            }, {
                cN: "doctag",
                b: "</?",
                e: ">",
                c: [e.PWM]
            }]
        }), e.CNM, {
            cN: "meta",
            b: "#",
            e: "$",
            k: {
                "meta-keyword": "if else elseif end region externalsource"
            }
        }]
    }
});