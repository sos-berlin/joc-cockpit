// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE
console.log("_______________________")

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  CodeMirror.defineMode("javascript", function(config, parserConfig) {
    var indentUnit = config.indentUnit;
    var statementIndent = parserConfig.statementIndent;
    var jsonldMode = parserConfig.jsonld;
    var jsonMode = parserConfig.json || jsonldMode;
    var trackScope = parserConfig.trackScope !== false
    var isTS = parserConfig.typescript;
    var wordRE = parserConfig.wordCharacters || /[\w$\xa1-\uffff]/;

    // Tokenizer

    var keywords = function(){
      function kw(type) {return {type: type, style: "keyword"};}
      var A = kw("keyword a"), B = kw("keyword b"), C = kw("keyword c"), D = kw("keyword d");
      var operator = kw("operator"), atom = {type: "atom", style: "atom"};

      return {
        "if": kw("if"), "while": A, "with": A, "else": B, "do": B, "try": B, "finally": B,
        "return": D, "break": D, "continue": D, "new": kw("new"), "delete": C, "void": C, "throw": C,
        "debugger": kw("debugger"), "var": kw("var"), "const": kw("var"), "let": kw("var"),
        "function": kw("function"), "catch": kw("catch"),
        "for": kw("for"), "switch": kw("switch"), "case": kw("case"), "default": kw("default"),
        "in": operator, "typeof": operator, "instanceof": operator,
        "true": atom, "false": atom, "null": atom, "undefined": atom, "NaN": atom, "Infinity": atom,
        "this": kw("this"), "class": kw("class"), "super": kw("atom"),
        "yield": C, "export": kw("export"), "import": kw("import"), "extends": C,
        "await": C
      };
    }();

    var isOperatorChar = /[+\-*&%=<>!?|~^@]/;
    var isJsonldKeyword = /^@(context|id|value|language|type|container|list|set|reverse|index|base|vocab|graph)"/;

    function readRegexp(stream) {
      var escaped = false, next, inSet = false;
      while ((next = stream.next()) != null) {
        if (!escaped) {
          if (next == "/" && !inSet) return;
          if (next == "[") inSet = true;
          else if (inSet && next == "]") inSet = false;
        }
        escaped = !escaped && next == "\\";
      }
    }

    // Used as scratch variables to communicate multiple values without
    // consing up tons of objects.
    var type, content;
    function ret(tp, style, cont) {
      type = tp; content = cont;
      return style;
    }
    function tokenBase(stream, state) {
      var ch = stream.next();
      if (ch == '"' || ch == "'") {
        state.tokenize = tokenString(ch);
        return state.tokenize(stream, state);
      } else if (ch == "." && stream.match(/^\d[\d_]*(?:[eE][+\-]?[\d_]+)?/)) {
        return ret("number", "number");
      } else if (ch == "." && stream.match("..")) {
        return ret("spread", "meta");
      } else if (/[\[\]{}\(\),;\:\.]/.test(ch)) {
        return ret(ch);
      } else if (ch == "=" && stream.eat(">")) {
        return ret("=>", "operator");
      } else if (ch == "0" && stream.match(/^(?:x[\dA-Fa-f_]+|o[0-7_]+|b[01_]+)n?/)) {
        return ret("number", "number");
      } else if (/\d/.test(ch)) {
        stream.match(/^[\d_]*(?:n|(?:\.[\d_]*)?(?:[eE][+\-]?[\d_]+)?)?/);
        return ret("number", "number");
      } else if (ch == "/") {
        if (stream.eat("*")) {
          state.tokenize = tokenComment;
          return tokenComment(stream, state);
        } else if (stream.eat("/")) {
          stream.skipToEnd();
          return ret("comment", "comment");
        } else if (expressionAllowed(stream, state, 1)) {
          readRegexp(stream);
          stream.match(/^\b(([gimyus])(?![gimyus]*\2))+\b/);
          return ret("regexp", "string-2");
        } else {
          stream.eat("=");
          return ret("operator", "operator", stream.current());
        }
      } else if (ch == "`") {
        state.tokenize = tokenQuasi;
        return tokenQuasi(stream, state);
      } else if (ch == "#" && stream.peek() == "!") {
        stream.skipToEnd();
        return ret("meta", "meta");
      } else if (ch == "#" && stream.eatWhile(wordRE)) {
        return ret("variable", "property")
      } else if (ch == "<" && stream.match("!--") ||
        (ch == "-" && stream.match("->") && !/\S/.test(stream.string.slice(0, stream.start)))) {
        stream.skipToEnd()
        return ret("comment", "comment")
      } else if (isOperatorChar.test(ch)) {
        if (ch != ">" || !state.lexical || state.lexical.type != ">") {
          if (stream.eat("=")) {
            if (ch == "!" || ch == "=") stream.eat("=")
          } else if (/[<>*+\-|&?]/.test(ch)) {
            stream.eat(ch)
            if (ch == ">") stream.eat(ch)
          }
        }
        if (ch == "?" && stream.eat(".")) return ret(".")
        return ret("operator", "operator", stream.current());
      } else if (wordRE.test(ch)) {
        stream.eatWhile(wordRE);
        var word = stream.current()
        if (state.lastType != ".") {
          if (keywords.propertyIsEnumerable(word)) {
            var kw = keywords[word]
            return ret(kw.type, kw.style, word)
          }
          if (word == "async" && stream.match(/^(\s|\/\*([^*]|\*(?!\/))*?\*\/)*[\[\(\w]/, false))
            return ret("async", "keyword", word)
        }
        return ret("variable", "variable", word)
      }
    }

    function tokenString(quote) {
      return function(stream, state) {
        var escaped = false, next;
        if (jsonldMode && stream.peek() == "@" && stream.match(isJsonldKeyword)){
          state.tokenize = tokenBase;
          return ret("jsonld-keyword", "meta");
        }
        while ((next = stream.next()) != null) {
          if (next == quote && !escaped) break;
          escaped = !escaped && next == "\\";
        }
        if (!escaped) state.tokenize = tokenBase;
        return ret("string", "string");
      };
    }

    function tokenComment(stream, state) {
      var maybeEnd = false, ch;
      while (ch = stream.next()) {
        if (ch == "/" && maybeEnd) {
          state.tokenize = tokenBase;
          break;
        }
        maybeEnd = (ch == "*");
      }
      return ret("comment", "comment");
    }

    function tokenQuasi(stream, state) {
      var escaped = false, next;
      while ((next = stream.next()) != null) {
        if (!escaped && (next == "`" || next == "$" && stream.eat("{"))) {
          state.tokenize = tokenBase;
          break;
        }
        escaped = !escaped && next == "\\";
      }
      return ret("quasi", "string-2", stream.current());
    }

    var brackets = "([{}])";
    // This is a crude lookahead trick to try and notice that we're
    // parsing the argument patterns for a fat-arrow function before we
    // actually hit the arrow token. It only works if the arrow is on
    // the same line as the arguments and there's no strange noise
    // (comments) in between. Fallback is to only notice when we hit the
    // arrow, and not declare the arguments as locals for the arrow
    // body.
    function findFatArrow(stream, state) {
      if (state.fatArrowAt) state.fatArrowAt = null;
      var arrow = stream.string.indexOf("=>", stream.start);
      if (arrow < 0) return;

      if (isTS) { // Try to skip TypeScript return type declarations after the arguments
        var m = /:\s*(?:\w+(?:<[^>]*>|\[\])?|\{[^}]*\})\s*$/.exec(stream.string.slice(stream.start, arrow))
        if (m) arrow = m.index
      }

      var depth = 0, sawSomething = false;
      for (var pos = arrow - 1; pos >= 0; --pos) {
        var ch = stream.string.charAt(pos);
        var bracket = brackets.indexOf(ch);
        if (bracket >= 0 && bracket < 3) {
          if (!depth) { ++pos; break; }
          if (--depth == 0) { if (ch == "(") sawSomething = true; break; }
        } else if (bracket >= 3 && bracket < 6) {
          ++depth;
        } else if (wordRE.test(ch)) {
          sawSomething = true;
        } else if (/["'\/`]/.test(ch)) {
          for (;; --pos) {
            if (pos == 0) return
            var next = stream.string.charAt(pos - 1)
            if (next == ch && stream.string.charAt(pos - 2) != "\\") { pos--; break }
          }
        } else if (sawSomething && !depth) {
          ++pos;
          break;
        }
      }
      if (sawSomething && !depth) state.fatArrowAt = pos;
    }

    // Parser

    var atomicTypes = {"atom": true, "number": true, "variable": true, "string": true,
      "regexp": true, "this": true, "import": true, "jsonld-keyword": true};

    function JSLexical(indented, column, type, align, prev, info) {
      this.indented = indented;
      this.column = column;
      this.type = type;
      this.prev = prev;
      this.info = info;
      if (align != null) this.align = align;
    }

    function inScope(state, varname) {
      if (!trackScope) return false
      for (var v = state.localVars; v; v = v.next)
        if (v.name == varname) return true;
      for (var cx = state.context; cx; cx = cx.prev) {
        for (var v = cx.vars; v; v = v.next)
          if (v.name == varname) return true;
      }
    }

    function parseJS(state, style, type, content, stream) {
      var cc = state.cc;
      // Communicate our context to the combinators.
      // (Less wasteful than consing up a hundred closures on every call.)
      cx.state = state; cx.stream = stream; cx.marked = null, cx.cc = cc; cx.style = style;

      if (!state.lexical.hasOwnProperty("align"))
        state.lexical.align = true;

      while(true) {
        var combinator = cc.length ? cc.pop() : jsonMode ? expression : statement;
        if (combinator(type, content)) {
          while(cc.length && cc[cc.length - 1].lex)
            cc.pop()();
          if (cx.marked) return cx.marked;
          if (type == "variable" && inScope(state, content)) return "variable-2";
          return style;
        }
      }
    }

    // Combinator utils

    var cx = {state: null, column: null, marked: null, cc: null};
    function pass() {
      for (var i = arguments.length - 1; i >= 0; i--) cx.cc.push(arguments[i]);
    }
    function cont() {
      pass.apply(null, arguments);
      return true;
    }
    function inList(name, list) {
      for (var v = list; v; v = v.next) if (v.name == name) return true
      return false;
    }
    function register(varname) {
      var state = cx.state;
      cx.marked = "def";
      if (!trackScope) return
      if (state.context) {
        if (state.lexical.info == "var" && state.context && state.context.block) {
          // FIXME function decls are also not block scoped
          var newContext = registerVarScoped(varname, state.context)
          if (newContext != null) {
            state.context = newContext
            return
          }
        } else if (!inList(varname, state.localVars)) {
          state.localVars = new Var(varname, state.localVars)
          return
        }
      }
      // Fall through means this is global
      if (parserConfig.globalVars && !inList(varname, state.globalVars))
        state.globalVars = new Var(varname, state.globalVars)
    }
    function registerVarScoped(varname, context) {
      if (!context) {
        return null
      } else if (context.block) {
        var inner = registerVarScoped(varname, context.prev)
        if (!inner) return null
        if (inner == context.prev) return context
        return new Context(inner, context.vars, true)
      } else if (inList(varname, context.vars)) {
        return context
      } else {
        return new Context(context.prev, new Var(varname, context.vars), false)
      }
    }

    function isModifier(name) {
      return name == "public" || name == "private" || name == "protected" || name == "abstract" || name == "readonly"
    }

    // Combinators

    function Context(prev, vars, block) { this.prev = prev; this.vars = vars; this.block = block }
    function Var(name, next) { this.name = name; this.next = next }

    var defaultVars = new Var("this", new Var("arguments", null))
    function pushcontext() {
      cx.state.context = new Context(cx.state.context, cx.state.localVars, false)
      cx.state.localVars = defaultVars
    }
    function pushblockcontext() {
      cx.state.context = new Context(cx.state.context, cx.state.localVars, true)
      cx.state.localVars = null
    }
    pushcontext.lex = pushblockcontext.lex = true
    function popcontext() {
      cx.state.localVars = cx.state.context.vars
      cx.state.context = cx.state.context.prev
    }
    popcontext.lex = true
    function pushlex(type, info) {
      var result = function() {
        var state = cx.state, indent = state.indented;
        if (state.lexical.type == "stat") indent = state.lexical.indented;
        else for (var outer = state.lexical; outer && outer.type == ")" && outer.align; outer = outer.prev)
          indent = outer.indented;
        state.lexical = new JSLexical(indent, cx.stream.column(), type, null, state.lexical, info);
      };
      result.lex = true;
      return result;
    }
    function poplex() {
      var state = cx.state;
      if (state.lexical.prev) {
        if (state.lexical.type == ")")
          state.indented = state.lexical.indented;
        state.lexical = state.lexical.prev;
      }
    }
    poplex.lex = true;

    function expect(wanted) {
      function exp(type) {
        if (type == wanted) return cont();
        else if (wanted == ";" || type == "}" || type == ")" || type == "]") return pass();
        else return cont(exp);
      };
      return exp;
    }

    function statement(type, value) {
      if (type == "var") return cont(pushlex("vardef", value), vardef, expect(";"), poplex);
      if (type == "keyword a") return cont(pushlex("form"), parenExpr, statement, poplex);
      if (type == "keyword b") return cont(pushlex("form"), statement, poplex);
      if (type == "keyword d") return cx.stream.match(/^\s*$/, false) ? cont() : cont(pushlex("stat"), maybeexpression, expect(";"), poplex);
      if (type == "debugger") return cont(expect(";"));
      if (type == "{") return cont(pushlex("}"), pushblockcontext, block, poplex, popcontext);
      if (type == ";") return cont();
      if (type == "if") {
        if (cx.state.lexical.info == "else" && cx.state.cc[cx.state.cc.length - 1] == poplex)
          cx.state.cc.pop()();
        return cont(pushlex("form"), parenExpr, statement, poplex, maybeelse);
      }
      if (type == "function") return cont(functiondef);
      if (type == "for") return cont(pushlex("form"), pushblockcontext, forspec, statement, popcontext, poplex);
      if (type == "class" || (isTS && value == "interface")) {
        cx.marked = "keyword"
        return cont(pushlex("form", type == "class" ? type : value), className, poplex)
      }
      if (type == "variable") {
        if (isTS && value == "declare") {
          cx.marked = "keyword"
          return cont(statement)
        } else if (isTS && (value == "module" || value == "enum" || value == "type") && cx.stream.match(/^\s*\w/, false)) {
          cx.marked = "keyword"
          if (value == "enum") return cont(enumdef);
          else if (value == "type") return cont(typename, expect("operator"), typeexpr, expect(";"));
          else return cont(pushlex("form"), pattern, expect("{"), pushlex("}"), block, poplex, poplex)
        } else if (isTS && value == "namespace") {
          cx.marked = "keyword"
          return cont(pushlex("form"), expression, statement, poplex)
        } else if (isTS && value == "abstract") {
          cx.marked = "keyword"
          return cont(statement)
        } else {
          return cont(pushlex("stat"), maybelabel);
        }
      }
      if (type == "switch") return cont(pushlex("form"), parenExpr, expect("{"), pushlex("}", "switch"), pushblockcontext,
        block, poplex, poplex, popcontext);
      if (type == "case") return cont(expression, expect(":"));
      if (type == "default") return cont(expect(":"));
      if (type == "catch") return cont(pushlex("form"), pushcontext, maybeCatchBinding, statement, poplex, popcontext);
      if (type == "export") return cont(pushlex("stat"), afterExport, poplex);
      if (type == "import") return cont(pushlex("stat"), afterImport, poplex);
      if (type == "async") return cont(statement)
      if (value == "@") return cont(expression, statement)
      return pass(pushlex("stat"), expression, expect(";"), poplex);
    }
    function maybeCatchBinding(type) {
      if (type == "(") return cont(funarg, expect(")"))
    }
    function expression(type, value) {
      return expressionInner(type, value, false);
    }
    function expressionNoComma(type, value) {
      return expressionInner(type, value, true);
    }
    function parenExpr(type) {
      if (type != "(") return pass()
      return cont(pushlex(")"), maybeexpression, expect(")"), poplex)
    }
    function expressionInner(type, value, noComma) {
      if (cx.state.fatArrowAt == cx.stream.start) {
        var body = noComma ? arrowBodyNoComma : arrowBody;
        if (type == "(") return cont(pushcontext, pushlex(")"), commasep(funarg, ")"), poplex, expect("=>"), body, popcontext);
        else if (type == "variable") return pass(pushcontext, pattern, expect("=>"), body, popcontext);
      }

      var maybeop = noComma ? maybeoperatorNoComma : maybeoperatorComma;
      if (atomicTypes.hasOwnProperty(type)) return cont(maybeop);
      if (type == "function") return cont(functiondef, maybeop);
      if (type == "class" || (isTS && value == "interface")) { cx.marked = "keyword"; return cont(pushlex("form"), classExpression, poplex); }
      if (type == "keyword c" || type == "async") return cont(noComma ? expressionNoComma : expression);
      if (type == "(") return cont(pushlex(")"), maybeexpression, expect(")"), poplex, maybeop);
      if (type == "operator" || type == "spread") return cont(noComma ? expressionNoComma : expression);
      if (type == "[") return cont(pushlex("]"), arrayLiteral, poplex, maybeop);
      if (type == "{") return contCommasep(objprop, "}", null, maybeop);
      if (type == "quasi") return pass(quasi, maybeop);
      if (type == "new") return cont(maybeTarget(noComma));
      return cont();
    }
    function maybeexpression(type) {
      if (type.match(/[;\}\)\],]/)) return pass();
      return pass(expression);
    }

    function maybeoperatorComma(type, value) {
      if (type == ",") return cont(maybeexpression);
      return maybeoperatorNoComma(type, value, false);
    }
    function maybeoperatorNoComma(type, value, noComma) {
      var me = noComma == false ? maybeoperatorComma : maybeoperatorNoComma;
      var expr = noComma == false ? expression : expressionNoComma;
      if (type == "=>") return cont(pushcontext, noComma ? arrowBodyNoComma : arrowBody, popcontext);
      if (type == "operator") {
        if (/\+\+|--/.test(value) || isTS && value == "!") return cont(me);
        if (isTS && value == "<" && cx.stream.match(/^([^<>]|<[^<>]*>)*>\s*\(/, false))
          return cont(pushlex(">"), commasep(typeexpr, ">"), poplex, me);
        if (value == "?") return cont(expression, expect(":"), expr);
        return cont(expr);
      }
      if (type == "quasi") { return pass(quasi, me); }
      if (type == ";") return;
      if (type == "(") return contCommasep(expressionNoComma, ")", "call", me);
      if (type == ".") return cont(property, me);
      if (type == "[") return cont(pushlex("]"), maybeexpression, expect("]"), poplex, me);
      if (isTS && value == "as") { cx.marked = "keyword"; return cont(typeexpr, me) }
      if (type == "regexp") {
        cx.state.lastType = cx.marked = "operator"
        cx.stream.backUp(cx.stream.pos - cx.stream.start - 1)
        return cont(expr)
      }
    }
    function quasi(type, value) {
      if (type != "quasi") return pass();
      if (value.slice(value.length - 2) != "${") return cont(quasi);
      return cont(maybeexpression, continueQuasi);
    }
    function continueQuasi(type) {
      if (type == "}") {
        cx.marked = "string-2";
        cx.state.tokenize = tokenQuasi;
        return cont(quasi);
      }
    }
    function arrowBody(type) {
      findFatArrow(cx.stream, cx.state);
      return pass(type == "{" ? statement : expression);
    }
    function arrowBodyNoComma(type) {
      findFatArrow(cx.stream, cx.state);
      return pass(type == "{" ? statement : expressionNoComma);
    }
    function maybeTarget(noComma) {
      return function(type) {
        if (type == ".") return cont(noComma ? targetNoComma : target);
        else if (type == "variable" && isTS) return cont(maybeTypeArgs, noComma ? maybeoperatorNoComma : maybeoperatorComma)
        else return pass(noComma ? expressionNoComma : expression);
      };
    }
    function target(_, value) {
      if (value == "target") { cx.marked = "keyword"; return cont(maybeoperatorComma); }
    }
    function targetNoComma(_, value) {
      if (value == "target") { cx.marked = "keyword"; return cont(maybeoperatorNoComma); }
    }
    function maybelabel(type) {
      if (type == ":") return cont(poplex, statement);
      return pass(maybeoperatorComma, expect(";"), poplex);
    }
    function property(type) {
      if (type == "variable") {cx.marked = "property"; return cont();}
    }
    function objprop(type, value) {
      if (type == "async") {
        cx.marked = "property";
        return cont(objprop);
      } else if (type == "variable" || cx.style == "keyword") {
        cx.marked = "property";
        if (value == "get" || value == "set") return cont(getterSetter);
        var m // Work around fat-arrow-detection complication for detecting typescript typed arrow params
        if (isTS && cx.state.fatArrowAt == cx.stream.start && (m = cx.stream.match(/^\s*:\s*/, false)))
          cx.state.fatArrowAt = cx.stream.pos + m[0].length
        return cont(afterprop);
      } else if (type == "number" || type == "string") {
        cx.marked = jsonldMode ? "property" : (cx.style + " property");
        return cont(afterprop);
      } else if (type == "jsonld-keyword") {
        return cont(afterprop);
      } else if (isTS && isModifier(value)) {
        cx.marked = "keyword"
        return cont(objprop)
      } else if (type == "[") {
        return cont(expression, maybetype, expect("]"), afterprop);
      } else if (type == "spread") {
        return cont(expressionNoComma, afterprop);
      } else if (value == "*") {
        cx.marked = "keyword";
        return cont(objprop);
      } else if (type == ":") {
        return pass(afterprop)
      }
    }
    function getterSetter(type) {
      if (type != "variable") return pass(afterprop);
      cx.marked = "property";
      return cont(functiondef);
    }
    function afterprop(type) {
      if (type == ":") return cont(expressionNoComma);
      if (type == "(") return pass(functiondef);
    }
    function commasep(what, end, sep) {
      function proceed(type, value) {
        if (sep ? sep.indexOf(type) > -1 : type == ",") {
          var lex = cx.state.lexical;
          if (lex.info == "call") lex.pos = (lex.pos || 0) + 1;
          return cont(function(type, value) {
            if (type == end || value == end) return pass()
            return pass(what)
          }, proceed);
        }
        if (type == end || value == end) return cont();
        if (sep && sep.indexOf(";") > -1) return pass(what)
        return cont(expect(end));
      }
      return function(type, value) {
        if (type == end || value == end) return cont();
        return pass(what, proceed);
      };
    }
    function contCommasep(what, end, info) {
      for (var i = 3; i < arguments.length; i++)
        cx.cc.push(arguments[i]);
      return cont(pushlex(end, info), commasep(what, end), poplex);
    }
    function block(type) {
      if (type == "}") return cont();
      return pass(statement, block);
    }
    function maybetype(type, value) {
      if (isTS) {
        if (type == ":") return cont(typeexpr);
        if (value == "?") return cont(maybetype);
      }
    }
    function maybetypeOrIn(type, value) {
      if (isTS && (type == ":" || value == "in")) return cont(typeexpr)
    }
    function mayberettype(type) {
      if (isTS && type == ":") {
        if (cx.stream.match(/^\s*\w+\s+is\b/, false)) return cont(expression, isKW, typeexpr)
        else return cont(typeexpr)
      }
    }
    function isKW(_, value) {
      if (value == "is") {
        cx.marked = "keyword"
        return cont()
      }
    }
    function typeexpr(type, value) {
      if (value == "keyof" || value == "typeof" || value == "infer" || value == "readonly") {
        cx.marked = "keyword"
        return cont(value == "typeof" ? expressionNoComma : typeexpr)
      }
      if (type == "variable" || value == "void") {
        cx.marked = "type"
        return cont(afterType)
      }
      if (value == "|" || value == "&") return cont(typeexpr)
      if (type == "string" || type == "number" || type == "atom") return cont(afterType);
      if (type == "[") return cont(pushlex("]"), commasep(typeexpr, "]", ","), poplex, afterType)
      if (type == "{") return cont(pushlex("}"), typeprops, poplex, afterType)
      if (type == "(") return cont(commasep(typearg, ")"), maybeReturnType, afterType)
      if (type == "<") return cont(commasep(typeexpr, ">"), typeexpr)
      if (type == "quasi") { return pass(quasiType, afterType); }
    }
    function maybeReturnType(type) {
      if (type == "=>") return cont(typeexpr)
    }
    function typeprops(type) {
      if (type.match(/[\}\)\]]/)) return cont()
      if (type == "," || type == ";") return cont(typeprops)
      return pass(typeprop, typeprops)
    }
    function typeprop(type, value) {
      if (type == "variable" || cx.style == "keyword") {
        cx.marked = "property"
        return cont(typeprop)
      } else if (value == "?" || type == "number" || type == "string") {
        return cont(typeprop)
      } else if (type == ":") {
        return cont(typeexpr)
      } else if (type == "[") {
        return cont(expect("variable"), maybetypeOrIn, expect("]"), typeprop)
      } else if (type == "(") {
        return pass(functiondecl, typeprop)
      } else if (!type.match(/[;\}\)\],]/)) {
        return cont()
      }
    }
    function quasiType(type, value) {
      if (type != "quasi") return pass();
      if (value.slice(value.length - 2) != "${") return cont(quasiType);
      return cont(typeexpr, continueQuasiType);
    }
    function continueQuasiType(type) {
      if (type == "}") {
        cx.marked = "string-2";
        cx.state.tokenize = tokenQuasi;
        return cont(quasiType);
      }
    }
    function typearg(type, value) {
      if (type == "variable" && cx.stream.match(/^\s*[?:]/, false) || value == "?") return cont(typearg)
      if (type == ":") return cont(typeexpr)
      if (type == "spread") return cont(typearg)
      return pass(typeexpr)
    }
    function afterType(type, value) {
      if (value == "<") return cont(pushlex(">"), commasep(typeexpr, ">"), poplex, afterType)
      if (value == "|" || type == "." || value == "&") return cont(typeexpr)
      if (type == "[") return cont(typeexpr, expect("]"), afterType)
      if (value == "extends" || value == "implements") { cx.marked = "keyword"; return cont(typeexpr) }
      if (value == "?") return cont(typeexpr, expect(":"), typeexpr)
    }
    function maybeTypeArgs(_, value) {
      if (value == "<") return cont(pushlex(">"), commasep(typeexpr, ">"), poplex, afterType)
    }
    function typeparam() {
      return pass(typeexpr, maybeTypeDefault)
    }
    function maybeTypeDefault(_, value) {
      if (value == "=") return cont(typeexpr)
    }
    function vardef(_, value) {
      if (value == "enum") {cx.marked = "keyword"; return cont(enumdef)}
      return pass(pattern, maybetype, maybeAssign, vardefCont);
    }
    function pattern(type, value) {
      if (isTS && isModifier(value)) { cx.marked = "keyword"; return cont(pattern) }
      if (type == "variable") { register(value); return cont(); }
      if (type == "spread") return cont(pattern);
      if (type == "[") return contCommasep(eltpattern, "]");
      if (type == "{") return contCommasep(proppattern, "}");
    }
    function proppattern(type, value) {
      if (type == "variable" && !cx.stream.match(/^\s*:/, false)) {
        register(value);
        return cont(maybeAssign);
      }
      if (type == "variable") cx.marked = "property";
      if (type == "spread") return cont(pattern);
      if (type == "}") return pass();
      if (type == "[") return cont(expression, expect(']'), expect(':'), proppattern);
      return cont(expect(":"), pattern, maybeAssign);
    }
    function eltpattern() {
      return pass(pattern, maybeAssign)
    }
    function maybeAssign(_type, value) {
      if (value == "=") return cont(expressionNoComma);
    }
    function vardefCont(type) {
      if (type == ",") return cont(vardef);
    }
    function maybeelse(type, value) {
      if (type == "keyword b" && value == "else") return cont(pushlex("form", "else"), statement, poplex);
    }
    function forspec(type, value) {
      if (value == "await") return cont(forspec);
      if (type == "(") return cont(pushlex(")"), forspec1, poplex);
    }
    function forspec1(type) {
      if (type == "var") return cont(vardef, forspec2);
      if (type == "variable") return cont(forspec2);
      return pass(forspec2)
    }
    function forspec2(type, value) {
      if (type == ")") return cont()
      if (type == ";") return cont(forspec2)
      if (value == "in" || value == "of") { cx.marked = "keyword"; return cont(expression, forspec2) }
      return pass(expression, forspec2)
    }
    function functiondef(type, value) {
      if (value == "*") {cx.marked = "keyword"; return cont(functiondef);}
      if (type == "variable") {register(value); return cont(functiondef);}
      if (type == "(") return cont(pushcontext, pushlex(")"), commasep(funarg, ")"), poplex, mayberettype, statement, popcontext);
      if (isTS && value == "<") return cont(pushlex(">"), commasep(typeparam, ">"), poplex, functiondef)
    }
    function functiondecl(type, value) {
      if (value == "*") {cx.marked = "keyword"; return cont(functiondecl);}
      if (type == "variable") {register(value); return cont(functiondecl);}
      if (type == "(") return cont(pushcontext, pushlex(")"), commasep(funarg, ")"), poplex, mayberettype, popcontext);
      if (isTS && value == "<") return cont(pushlex(">"), commasep(typeparam, ">"), poplex, functiondecl)
    }
    function typename(type, value) {
      if (type == "keyword" || type == "variable") {
        cx.marked = "type"
        return cont(typename)
      } else if (value == "<") {
        return cont(pushlex(">"), commasep(typeparam, ">"), poplex)
      }
    }
    function funarg(type, value) {
      if (value == "@") cont(expression, funarg)
      if (type == "spread") return cont(funarg);
      if (isTS && isModifier(value)) { cx.marked = "keyword"; return cont(funarg); }
      if (isTS && type == "this") return cont(maybetype, maybeAssign)
      return pass(pattern, maybetype, maybeAssign);
    }
    function classExpression(type, value) {
      // Class expressions may have an optional name.
      if (type == "variable") return className(type, value);
      return classNameAfter(type, value);
    }
    function className(type, value) {
      if (type == "variable") {register(value); return cont(classNameAfter);}
    }
    function classNameAfter(type, value) {
      if (value == "<") return cont(pushlex(">"), commasep(typeparam, ">"), poplex, classNameAfter)
      if (value == "extends" || value == "implements" || (isTS && type == ",")) {
        if (value == "implements") cx.marked = "keyword";
        return cont(isTS ? typeexpr : expression, classNameAfter);
      }
      if (type == "{") return cont(pushlex("}"), classBody, poplex);
    }
    function classBody(type, value) {
      if (type == "async" ||
        (type == "variable" &&
          (value == "static" || value == "get" || value == "set" || (isTS && isModifier(value))) &&
          cx.stream.match(/^\s+#?[\w$\xa1-\uffff]/, false))) {
        cx.marked = "keyword";
        return cont(classBody);
      }
      if (type == "variable" || cx.style == "keyword") {
        cx.marked = "property";
        return cont(classfield, classBody);
      }
      if (type == "number" || type == "string") return cont(classfield, classBody);
      if (type == "[")
        return cont(expression, maybetype, expect("]"), classfield, classBody)
      if (value == "*") {
        cx.marked = "keyword";
        return cont(classBody);
      }
      if (isTS && type == "(") return pass(functiondecl, classBody)
      if (type == ";" || type == ",") return cont(classBody);
      if (type == "}") return cont();
      if (value == "@") return cont(expression, classBody)
    }
    function classfield(type, value) {
      if (value == "!") return cont(classfield)
      if (value == "?") return cont(classfield)
      if (type == ":") return cont(typeexpr, maybeAssign)
      if (value == "=") return cont(expressionNoComma)
      var context = cx.state.lexical.prev, isInterface = context && context.info == "interface"
      return pass(isInterface ? functiondecl : functiondef)
    }
    function afterExport(type, value) {
      if (value == "*") { cx.marked = "keyword"; return cont(maybeFrom, expect(";")); }
      if (value == "default") { cx.marked = "keyword"; return cont(expression, expect(";")); }
      if (type == "{") return cont(commasep(exportField, "}"), maybeFrom, expect(";"));
      return pass(statement);
    }
    function exportField(type, value) {
      if (value == "as") { cx.marked = "keyword"; return cont(expect("variable")); }
      if (type == "variable") return pass(expressionNoComma, exportField);
    }
    function afterImport(type) {
      if (type == "string") return cont();
      if (type == "(") return pass(expression);
      if (type == ".") return pass(maybeoperatorComma);
      return pass(importSpec, maybeMoreImports, maybeFrom);
    }
    function importSpec(type, value) {
      if (type == "{") return contCommasep(importSpec, "}");
      if (type == "variable") register(value);
      if (value == "*") cx.marked = "keyword";
      return cont(maybeAs);
    }
    function maybeMoreImports(type) {
      if (type == ",") return cont(importSpec, maybeMoreImports)
    }
    function maybeAs(_type, value) {
      if (value == "as") { cx.marked = "keyword"; return cont(importSpec); }
    }
    function maybeFrom(_type, value) {
      if (value == "from") { cx.marked = "keyword"; return cont(expression); }
    }
    function arrayLiteral(type) {
      if (type == "]") return cont();
      return pass(commasep(expressionNoComma, "]"));
    }
    function enumdef() {
      return pass(pushlex("form"), pattern, expect("{"), pushlex("}"), commasep(enummember, "}"), poplex, poplex)
    }
    function enummember() {
      return pass(pattern, maybeAssign);
    }

    function isContinuedStatement(state, textAfter) {
      return state.lastType == "operator" || state.lastType == "," ||
        isOperatorChar.test(textAfter.charAt(0)) ||
        /[,.]/.test(textAfter.charAt(0));
    }

    function expressionAllowed(stream, state, backUp) {
      return state.tokenize == tokenBase &&
        /^(?:operator|sof|keyword [bcd]|case|new|export|default|spread|[\[{}\(,;:]|=>)$/.test(state.lastType) ||
        (state.lastType == "quasi" && /\{\s*$/.test(stream.string.slice(0, stream.pos - (backUp || 0))))
    }

    // Interface

    return {
      startState: function(basecolumn) {
        var state = {
          tokenize: tokenBase,
          lastType: "sof",
          cc: [],
          lexical: new JSLexical((basecolumn || 0) - indentUnit, 0, "block", false),
          localVars: parserConfig.localVars,
          context: parserConfig.localVars && new Context(null, null, false),
          indented: basecolumn || 0
        };
        if (parserConfig.globalVars && typeof parserConfig.globalVars == "object")
          state.globalVars = parserConfig.globalVars;
        return state;
      },

      token: function(stream, state) {
        if (stream.sol()) {
          if (!state.lexical.hasOwnProperty("align"))
            state.lexical.align = false;
          state.indented = stream.indentation();
          findFatArrow(stream, state);
        }
        if (state.tokenize != tokenComment && stream.eatSpace()) return null;
        var style = state.tokenize(stream, state);
        if (type == "comment") return style;
        state.lastType = type == "operator" && (content == "++" || content == "--") ? "incdec" : type;
        return parseJS(state, style, type, content, stream);
      },

      indent: function(state, textAfter) {
        if (state.tokenize == tokenComment || state.tokenize == tokenQuasi) return CodeMirror.Pass;
        if (state.tokenize != tokenBase) return 0;
        var firstChar = textAfter && textAfter.charAt(0), lexical = state.lexical, top
        // Kludge to prevent 'maybelse' from blocking lexical scope pops
        if (!/^\s*else\b/.test(textAfter)) for (var i = state.cc.length - 1; i >= 0; --i) {
          var c = state.cc[i];
          if (c == poplex) lexical = lexical.prev;
          else if (c != maybeelse && c != popcontext) break;
        }
        while ((lexical.type == "stat" || lexical.type == "form") &&
        (firstChar == "}" || ((top = state.cc[state.cc.length - 1]) &&
          (top == maybeoperatorComma || top == maybeoperatorNoComma) &&
          !/^[,\.=+\-*:?[\(]/.test(textAfter))))
          lexical = lexical.prev;
        if (statementIndent && lexical.type == ")" && lexical.prev.type == "stat")
          lexical = lexical.prev;
        var type = lexical.type, closing = firstChar == type;

        if (type == "vardef") return lexical.indented + (state.lastType == "operator" || state.lastType == "," ? lexical.info.length + 1 : 0);
        else if (type == "form" && firstChar == "{") return lexical.indented;
        else if (type == "form") return lexical.indented + indentUnit;
        else if (type == "stat")
          return lexical.indented + (isContinuedStatement(state, textAfter) ? statementIndent || indentUnit : 0);
        else if (lexical.info == "switch" && !closing && parserConfig.doubleIndentSwitch != false)
          return lexical.indented + (/^(?:case|default)\b/.test(textAfter) ? indentUnit : 2 * indentUnit);
        else if (lexical.align) return lexical.column + (closing ? 0 : 1);
        else return lexical.indented + (closing ? 0 : indentUnit);
      },

      electricInput: /^\s*(?:case .*?:|default:|\{|\})$/,
      blockCommentStart: jsonMode ? null : "/*",
      blockCommentEnd: jsonMode ? null : "*/",
      blockCommentContinue: jsonMode ? null : " * ",
      lineComment: jsonMode ? null : "//",
      fold: "brace",
      closeBrackets: "()[]{}''\"\"``",

      helperType: jsonMode ? "json" : "javascript",
      jsonldMode: jsonldMode,
      jsonMode: jsonMode,

      expressionAllowed: expressionAllowed,

      skipExpression: function(state) {
        parseJS(state, "atom", "atom", "true", new CodeMirror.StringStream("", 2, null))
      }
    };
  });

  CodeMirror.registerHelper("wordChars", "javascript", /[\w$]/);

  CodeMirror.defineMIME("text/javascript", "javascript");
  CodeMirror.defineMIME("text/ecmascript", "javascript");
  CodeMirror.defineMIME("application/javascript", "javascript");
  CodeMirror.defineMIME("application/x-javascript", "javascript");
  CodeMirror.defineMIME("application/ecmascript", "javascript");
  CodeMirror.defineMIME("application/json", { name: "javascript", json: true });
  CodeMirror.defineMIME("application/x-json", { name: "javascript", json: true });
  CodeMirror.defineMIME("application/manifest+json", { name: "javascript", json: true })
  CodeMirror.defineMIME("application/ld+json", { name: "javascript", jsonld: true });
  CodeMirror.defineMIME("text/typescript", { name: "javascript", typescript: true });
  CodeMirror.defineMIME("application/typescript", { name: "javascript", typescript: true });

});



// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  CodeMirror.defineMode('shell', function() {

    var words = {};
    function define(style, dict) {
      for(var i = 0; i < dict.length; i++) {
        words[dict[i]] = style;
      }
    };

    var commonAtoms = ["true", "false"];
    var commonKeywords = ["if", "then", "do", "else", "elif", "while", "until", "for", "in", "esac", "fi",
      "fin", "fil", "done", "exit", "set", "unset", "export", "function"];
    var commonCommands = ["ab", "awk", "bash", "beep", "cat", "cc", "cd", "chown", "chmod", "chroot", "clear",
      "cp", "curl", "cut", "diff", "echo", "find", "gawk", "gcc", "get", "git", "grep", "hg", "kill", "killall",
      "ln", "ls", "make", "mkdir", "openssl", "mv", "nc", "nl", "node", "npm", "ping", "ps", "restart", "rm",
      "rmdir", "sed", "service", "sh", "shopt", "shred", "source", "sort", "sleep", "ssh", "start", "stop",
      "su", "sudo", "svn", "tee", "telnet", "top", "touch", "vi", "vim", "wall", "wc", "wget", "who", "write",
      "yes", "zsh"];

    CodeMirror.registerHelper("hintWords", "shell", commonAtoms.concat(commonKeywords, commonCommands));

    define('atom', commonAtoms);
    define('keyword', commonKeywords);
    define('builtin', commonCommands);

    function tokenBase(stream, state) {
      if (stream.eatSpace()) return null;

      var sol = stream.sol();
      var ch = stream.next();

      if (ch === '\\') {
        stream.next();
        return null;
      }
      if (ch === '\'' || ch === '"' || ch === '`') {
        state.tokens.unshift(tokenString(ch, ch === "`" ? "quote" : "string"));
        return tokenize(stream, state);
      }
      if (ch === '#') {
        if (sol && stream.eat('!')) {
          stream.skipToEnd();
          return 'meta'; // 'comment'?
        }
        stream.skipToEnd();
        return 'comment';
      }
      if (ch === '$') {
        state.tokens.unshift(tokenDollar);
        return tokenize(stream, state);
      }
      if (ch === '+' || ch === '=') {
        return 'operator';
      }
      if (ch === '-') {
        stream.eat('-');
        stream.eatWhile(/\w/);
        return 'attribute';
      }
      if (ch == "<") {
        if (stream.match("<<")) return "operator"
        var heredoc = stream.match(/^<-?\s*['"]?([^'"]*)['"]?/)
        if (heredoc) {
          state.tokens.unshift(tokenHeredoc(heredoc[1]))
          return 'string-2'
        }
      }
      if (/\d/.test(ch)) {
        stream.eatWhile(/\d/);
        if(stream.eol() || !/\w/.test(stream.peek())) {
          return 'number';
        }
      }
      stream.eatWhile(/[\w-]/);
      var cur = stream.current();
      if (stream.peek() === '=' && /\w+/.test(cur)) return 'def';
      return words.hasOwnProperty(cur) ? words[cur] : null;
    }

    function tokenString(quote, style) {
      var close = quote == "(" ? ")" : quote == "{" ? "}" : quote
      return function(stream, state) {
        var next, escaped = false;
        while ((next = stream.next()) != null) {
          if (next === close && !escaped) {
            state.tokens.shift();
            break;
          } else if (next === '$' && !escaped && quote !== "'" && stream.peek() != close) {
            escaped = true;
            stream.backUp(1);
            state.tokens.unshift(tokenDollar);
            break;
          } else if (!escaped && quote !== close && next === quote) {
            state.tokens.unshift(tokenString(quote, style))
            return tokenize(stream, state)
          } else if (!escaped && /['"]/.test(next) && !/['"]/.test(quote)) {
            state.tokens.unshift(tokenStringStart(next, "string"));
            stream.backUp(1);
            break;
          }
          escaped = !escaped && next === '\\';
        }
        return style;
      };
    };

    function tokenStringStart(quote, style) {
      return function(stream, state) {
        state.tokens[0] = tokenString(quote, style)
        stream.next()
        return tokenize(stream, state)
      }
    }

    var tokenDollar = function(stream, state) {
      if (state.tokens.length > 1) stream.eat('$');
      var ch = stream.next()
      if (/['"({]/.test(ch)) {
        state.tokens[0] = tokenString(ch, ch == "(" ? "quote" : ch == "{" ? "def" : "string");
        return tokenize(stream, state);
      }
      if (!/\d/.test(ch)) stream.eatWhile(/\w/);
      state.tokens.shift();
      return 'def';
    };

    function tokenHeredoc(delim) {
      return function(stream, state) {
        if (stream.sol() && stream.string == delim) state.tokens.shift()
        stream.skipToEnd()
        return "string-2"
      }
    }

    function tokenize(stream, state) {
      return (state.tokens[0] || tokenBase) (stream, state);
    };

    return {
      startState: function() {return {tokens:[]};},
      token: function(stream, state) {
        return tokenize(stream, state);
      },
      closeBrackets: "()[]{}''\"\"``",
      lineComment: '#',
      fold: "brace"
    };
  });

  CodeMirror.defineMIME('text/x-sh', 'shell');
// Apache uses a slightly different Media Type for Shell scripts
// http://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types
  CodeMirror.defineMIME('application/x-sh', 'shell');

});

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  var htmlConfig = {
    autoSelfClosers: {'area': true, 'base': true, 'br': true, 'col': true, 'command': true,
      'embed': true, 'frame': true, 'hr': true, 'img': true, 'input': true,
      'keygen': true, 'link': true, 'meta': true, 'param': true, 'source': true,
      'track': true, 'wbr': true, 'menuitem': true},
    implicitlyClosed: {'dd': true, 'li': true, 'optgroup': true, 'option': true, 'p': true,
      'rp': true, 'rt': true, 'tbody': true, 'td': true, 'tfoot': true,
      'th': true, 'tr': true},
    contextGrabbers: {
      'dd': {'dd': true, 'dt': true},
      'dt': {'dd': true, 'dt': true},
      'li': {'li': true},
      'option': {'option': true, 'optgroup': true},
      'optgroup': {'optgroup': true},
      'p': {'address': true, 'article': true, 'aside': true, 'blockquote': true, 'dir': true,
        'div': true, 'dl': true, 'fieldset': true, 'footer': true, 'form': true,
        'h1': true, 'h2': true, 'h3': true, 'h4': true, 'h5': true, 'h6': true,
        'header': true, 'hgroup': true, 'hr': true, 'menu': true, 'nav': true, 'ol': true,
        'p': true, 'pre': true, 'section': true, 'table': true, 'ul': true},
      'rp': {'rp': true, 'rt': true},
      'rt': {'rp': true, 'rt': true},
      'tbody': {'tbody': true, 'tfoot': true},
      'td': {'td': true, 'th': true},
      'tfoot': {'tbody': true},
      'th': {'td': true, 'th': true},
      'thead': {'tbody': true, 'tfoot': true},
      'tr': {'tr': true}
    },
    doNotIndent: {"pre": true},
    allowUnquoted: true,
    allowMissing: true,
    caseFold: true
  }

  var xmlConfig = {
    autoSelfClosers: {},
    implicitlyClosed: {},
    contextGrabbers: {},
    doNotIndent: {},
    allowUnquoted: false,
    allowMissing: false,
    allowMissingTagName: false,
    caseFold: false
  }

  CodeMirror.defineMode("xml", function(editorConf, config_) {
    var indentUnit = editorConf.indentUnit
    var config = {}
    var defaults = config_.htmlMode ? htmlConfig : xmlConfig
    for (var prop in defaults) config[prop] = defaults[prop]
    for (var prop in config_) config[prop] = config_[prop]

    // Return variables for tokenizers
    var type, setStyle;

    function inText(stream, state) {
      function chain(parser) {
        state.tokenize = parser;
        return parser(stream, state);
      }

      var ch = stream.next();
      if (ch == "<") {
        if (stream.eat("!")) {
          if (stream.eat("[")) {
            if (stream.match("CDATA[")) return chain(inBlock("atom", "]]>"));
            else return null;
          } else if (stream.match("--")) {
            return chain(inBlock("comment", "-->"));
          } else if (stream.match("DOCTYPE", true, true)) {
            stream.eatWhile(/[\w\._\-]/);
            return chain(doctype(1));
          } else {
            return null;
          }
        } else if (stream.eat("?")) {
          stream.eatWhile(/[\w\._\-]/);
          state.tokenize = inBlock("meta", "?>");
          return "meta";
        } else {
          type = stream.eat("/") ? "closeTag" : "openTag";
          state.tokenize = inTag;
          return "tag bracket";
        }
      } else if (ch == "&") {
        var ok;
        if (stream.eat("#")) {
          if (stream.eat("x")) {
            ok = stream.eatWhile(/[a-fA-F\d]/) && stream.eat(";");
          } else {
            ok = stream.eatWhile(/[\d]/) && stream.eat(";");
          }
        } else {
          ok = stream.eatWhile(/[\w\.\-:]/) && stream.eat(";");
        }
        return ok ? "atom" : "error";
      } else {
        stream.eatWhile(/[^&<]/);
        return null;
      }
    }
    inText.isInText = true;

    function inTag(stream, state) {
      var ch = stream.next();
      if (ch == ">" || (ch == "/" && stream.eat(">"))) {
        state.tokenize = inText;
        type = ch == ">" ? "endTag" : "selfcloseTag";
        return "tag bracket";
      } else if (ch == "=") {
        type = "equals";
        return null;
      } else if (ch == "<") {
        state.tokenize = inText;
        state.state = baseState;
        state.tagName = state.tagStart = null;
        var next = state.tokenize(stream, state);
        return next ? next + " tag error" : "tag error";
      } else if (/[\'\"]/.test(ch)) {
        state.tokenize = inAttribute(ch);
        state.stringStartCol = stream.column();
        return state.tokenize(stream, state);
      } else {
        stream.match(/^[^\s\u00a0=<>\"\']*[^\s\u00a0=<>\"\'\/]/);
        return "word";
      }
    }

    function inAttribute(quote) {
      var closure = function(stream, state) {
        while (!stream.eol()) {
          if (stream.next() == quote) {
            state.tokenize = inTag;
            break;
          }
        }
        return "string";
      };
      closure.isInAttribute = true;
      return closure;
    }

    function inBlock(style, terminator) {
      return function(stream, state) {
        while (!stream.eol()) {
          if (stream.match(terminator)) {
            state.tokenize = inText;
            break;
          }
          stream.next();
        }
        return style;
      }
    }

    function doctype(depth) {
      return function(stream, state) {
        var ch;
        while ((ch = stream.next()) != null) {
          if (ch == "<") {
            state.tokenize = doctype(depth + 1);
            return state.tokenize(stream, state);
          } else if (ch == ">") {
            if (depth == 1) {
              state.tokenize = inText;
              break;
            } else {
              state.tokenize = doctype(depth - 1);
              return state.tokenize(stream, state);
            }
          }
        }
        return "meta";
      };
    }

    function lower(tagName) {
      return tagName && tagName.toLowerCase();
    }

    function Context(state, tagName, startOfLine) {
      this.prev = state.context;
      this.tagName = tagName || "";
      this.indent = state.indented;
      this.startOfLine = startOfLine;
      if (config.doNotIndent.hasOwnProperty(tagName) || (state.context && state.context.noIndent))
        this.noIndent = true;
    }
    function popContext(state) {
      if (state.context) state.context = state.context.prev;
    }
    function maybePopContext(state, nextTagName) {
      var parentTagName;
      while (true) {
        if (!state.context) {
          return;
        }
        parentTagName = state.context.tagName;
        if (!config.contextGrabbers.hasOwnProperty(lower(parentTagName)) ||
          !config.contextGrabbers[lower(parentTagName)].hasOwnProperty(lower(nextTagName))) {
          return;
        }
        popContext(state);
      }
    }

    function baseState(type, stream, state) {
      if (type == "openTag") {
        state.tagStart = stream.column();
        return tagNameState;
      } else if (type == "closeTag") {
        return closeTagNameState;
      } else {
        return baseState;
      }
    }
    function tagNameState(type, stream, state) {
      if (type == "word") {
        state.tagName = stream.current();
        setStyle = "tag";
        return attrState;
      } else if (config.allowMissingTagName && type == "endTag") {
        setStyle = "tag bracket";
        return attrState(type, stream, state);
      } else {
        setStyle = "error";
        return tagNameState;
      }
    }
    function closeTagNameState(type, stream, state) {
      if (type == "word") {
        var tagName = stream.current();
        if (state.context && state.context.tagName != tagName &&
          config.implicitlyClosed.hasOwnProperty(lower(state.context.tagName)))
          popContext(state);
        if ((state.context && state.context.tagName == tagName) || config.matchClosing === false) {
          setStyle = "tag";
          return closeState;
        } else {
          setStyle = "tag error";
          return closeStateErr;
        }
      } else if (config.allowMissingTagName && type == "endTag") {
        setStyle = "tag bracket";
        return closeState(type, stream, state);
      } else {
        setStyle = "error";
        return closeStateErr;
      }
    }

    function closeState(type, _stream, state) {
      if (type != "endTag") {
        setStyle = "error";
        return closeState;
      }
      popContext(state);
      return baseState;
    }
    function closeStateErr(type, stream, state) {
      setStyle = "error";
      return closeState(type, stream, state);
    }

    function attrState(type, _stream, state) {
      if (type == "word") {
        setStyle = "attribute";
        return attrEqState;
      } else if (type == "endTag" || type == "selfcloseTag") {
        var tagName = state.tagName, tagStart = state.tagStart;
        state.tagName = state.tagStart = null;
        if (type == "selfcloseTag" ||
          config.autoSelfClosers.hasOwnProperty(lower(tagName))) {
          maybePopContext(state, tagName);
        } else {
          maybePopContext(state, tagName);
          state.context = new Context(state, tagName, tagStart == state.indented);
        }
        return baseState;
      }
      setStyle = "error";
      return attrState;
    }
    function attrEqState(type, stream, state) {
      if (type == "equals") return attrValueState;
      if (!config.allowMissing) setStyle = "error";
      return attrState(type, stream, state);
    }
    function attrValueState(type, stream, state) {
      if (type == "string") return attrContinuedState;
      if (type == "word" && config.allowUnquoted) {setStyle = "string"; return attrState;}
      setStyle = "error";
      return attrState(type, stream, state);
    }
    function attrContinuedState(type, stream, state) {
      if (type == "string") return attrContinuedState;
      return attrState(type, stream, state);
    }

    return {
      startState: function(baseIndent) {
        var state = {tokenize: inText,
          state: baseState,
          indented: baseIndent || 0,
          tagName: null, tagStart: null,
          context: null}
        if (baseIndent != null) state.baseIndent = baseIndent
        return state
      },

      token: function(stream, state) {
        if (!state.tagName && stream.sol())
          state.indented = stream.indentation();

        if (stream.eatSpace()) return null;
        type = null;
        var style = state.tokenize(stream, state);
        if ((style || type) && style != "comment") {
          setStyle = null;
          state.state = state.state(type || style, stream, state);
          if (setStyle)
            style = setStyle == "error" ? style + " error" : setStyle;
        }
        return style;
      },

      indent: function(state, textAfter, fullLine) {
        var context = state.context;
        // Indent multi-line strings (e.g. css).
        if (state.tokenize.isInAttribute) {
          if (state.tagStart == state.indented)
            return state.stringStartCol + 1;
          else
            return state.indented + indentUnit;
        }
        if (context && context.noIndent) return CodeMirror.Pass;
        if (state.tokenize != inTag && state.tokenize != inText)
          return fullLine ? fullLine.match(/^(\s*)/)[0].length : 0;
        // Indent the starts of attribute names.
        if (state.tagName) {
          if (config.multilineTagIndentPastTag !== false)
            return state.tagStart + state.tagName.length + 2;
          else
            return state.tagStart + indentUnit * (config.multilineTagIndentFactor || 1);
        }
        if (config.alignCDATA && /<!\[CDATA\[/.test(textAfter)) return 0;
        var tagAfter = textAfter && /^<(\/)?([\w_:\.-]*)/.exec(textAfter);
        if (tagAfter && tagAfter[1]) { // Closing tag spotted
          while (context) {
            if (context.tagName == tagAfter[2]) {
              context = context.prev;
              break;
            } else if (config.implicitlyClosed.hasOwnProperty(lower(context.tagName))) {
              context = context.prev;
            } else {
              break;
            }
          }
        } else if (tagAfter) { // Opening tag spotted
          while (context) {
            var grabbers = config.contextGrabbers[lower(context.tagName)];
            if (grabbers && grabbers.hasOwnProperty(lower(tagAfter[2])))
              context = context.prev;
            else
              break;
          }
        }
        while (context && context.prev && !context.startOfLine)
          context = context.prev;
        if (context) return context.indent + indentUnit;
        else return state.baseIndent || 0;
      },

      electricInput: /<\/[\s\w:]+>$/,
      blockCommentStart: "<!--",
      blockCommentEnd: "-->",

      configuration: config.htmlMode ? "html" : "xml",
      helperType: config.htmlMode ? "html" : "xml",

      skipAttribute: function(state) {
        if (state.state == attrValueState)
          state.state = attrState
      },

      xmlCurrentTag: function(state) {
        return state.tagName ? {name: state.tagName, close: state.type == "closeTag"} : null
      },

      xmlCurrentContext: function(state) {
        var context = []
        for (var cx = state.context; cx; cx = cx.prev)
          context.push(cx.tagName)
        return context.reverse()
      }
    };
  });

  CodeMirror.defineMIME("text/xml", "xml");
  CodeMirror.defineMIME("application/xml", "xml");
  if (!CodeMirror.mimeModes.hasOwnProperty("text/html"))
    CodeMirror.defineMIME("text/html", {name: "xml", htmlMode: true});

});


// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  var defaults = {
    pairs: "()[]{}''\"\"",
    closeBefore: ")]}'\":;>",
    triples: "",
    explode: "[]{}"
  };

  var Pos = CodeMirror.Pos;

  CodeMirror.defineOption("autoCloseBrackets", false, function(cm, val, old) {
    if (old && old != CodeMirror.Init) {
      cm.removeKeyMap(keyMap);
      cm.state.closeBrackets = null;
    }
    if (val) {
      ensureBound(getOption(val, "pairs"))
      cm.state.closeBrackets = val;
      cm.addKeyMap(keyMap);
    }
  });

  function getOption(conf, name) {
    if (name == "pairs" && typeof conf == "string") return conf;
    if (typeof conf == "object" && conf[name] != null) return conf[name];
    return defaults[name];
  }

  var keyMap = {Backspace: handleBackspace, Enter: handleEnter};
  function ensureBound(chars) {
    for (var i = 0; i < chars.length; i++) {
      var ch = chars.charAt(i), key = "'" + ch + "'"
      if (!keyMap[key]) keyMap[key] = handler(ch)
    }
  }
  ensureBound(defaults.pairs + "`")

  function handler(ch) {
    return function(cm) { return handleChar(cm, ch); };
  }

  function getConfig(cm) {
    var deflt = cm.state.closeBrackets;
    if (!deflt || deflt.override) return deflt;
    var mode = cm.getModeAt(cm.getCursor());
    return mode.closeBrackets || deflt;
  }

  function handleBackspace(cm) {
    var conf = getConfig(cm);
    if (!conf || cm.getOption("disableInput")) return CodeMirror.Pass;

    var pairs = getOption(conf, "pairs");
    var ranges = cm.listSelections();
    for (var i = 0; i < ranges.length; i++) {
      if (!ranges[i].empty()) return CodeMirror.Pass;
      var around = charsAround(cm, ranges[i].head);
      if (!around || pairs.indexOf(around) % 2 != 0) return CodeMirror.Pass;
    }
    for (var i = ranges.length - 1; i >= 0; i--) {
      var cur = ranges[i].head;
      cm.replaceRange("", Pos(cur.line, cur.ch - 1), Pos(cur.line, cur.ch + 1), "+delete");
    }
  }

  function handleEnter(cm) {
    var conf = getConfig(cm);
    var explode = conf && getOption(conf, "explode");
    if (!explode || cm.getOption("disableInput")) return CodeMirror.Pass;

    var ranges = cm.listSelections();
    for (var i = 0; i < ranges.length; i++) {
      if (!ranges[i].empty()) return CodeMirror.Pass;
      var around = charsAround(cm, ranges[i].head);
      if (!around || explode.indexOf(around) % 2 != 0) return CodeMirror.Pass;
    }
    cm.operation(function() {
      var linesep = cm.lineSeparator() || "\n";
      cm.replaceSelection(linesep + linesep, null);
      moveSel(cm, -1)
      ranges = cm.listSelections();
      for (var i = 0; i < ranges.length; i++) {
        var line = ranges[i].head.line;
        cm.indentLine(line, null, true);
        cm.indentLine(line + 1, null, true);
      }
    });
  }

  function moveSel(cm, dir) {
    var newRanges = [], ranges = cm.listSelections(), primary = 0
    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i]
      if (range.head == cm.getCursor()) primary = i
      var pos = range.head.ch || dir > 0 ? {line: range.head.line, ch: range.head.ch + dir} : {line: range.head.line - 1}
      newRanges.push({anchor: pos, head: pos})
    }
    cm.setSelections(newRanges, primary)
  }

  function contractSelection(sel) {
    var inverted = CodeMirror.cmpPos(sel.anchor, sel.head) > 0;
    return {anchor: new Pos(sel.anchor.line, sel.anchor.ch + (inverted ? -1 : 1)),
      head: new Pos(sel.head.line, sel.head.ch + (inverted ? 1 : -1))};
  }

  function handleChar(cm, ch) {
    var conf = getConfig(cm);
    if (!conf || cm.getOption("disableInput")) return CodeMirror.Pass;

    var pairs = getOption(conf, "pairs");
    var pos = pairs.indexOf(ch);
    if (pos == -1) return CodeMirror.Pass;

    var closeBefore = getOption(conf,"closeBefore");

    var triples = getOption(conf, "triples");

    var identical = pairs.charAt(pos + 1) == ch;
    var ranges = cm.listSelections();
    var opening = pos % 2 == 0;

    var type;
    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i], cur = range.head, curType;
      var next = cm.getRange(cur, Pos(cur.line, cur.ch + 1));
      if (opening && !range.empty()) {
        curType = "surround";
      } else if ((identical || !opening) && next == ch) {
        if (identical && stringStartsAfter(cm, cur))
          curType = "both";
        else if (triples.indexOf(ch) >= 0 && cm.getRange(cur, Pos(cur.line, cur.ch + 3)) == ch + ch + ch)
          curType = "skipThree";
        else
          curType = "skip";
      } else if (identical && cur.ch > 1 && triples.indexOf(ch) >= 0 &&
        cm.getRange(Pos(cur.line, cur.ch - 2), cur) == ch + ch) {
        if (cur.ch > 2 && /\bstring/.test(cm.getTokenTypeAt(Pos(cur.line, cur.ch - 2)))) return CodeMirror.Pass;
        curType = "addFour";
      } else if (identical) {
        var prev = cur.ch == 0 ? " " : cm.getRange(Pos(cur.line, cur.ch - 1), cur)
        if (!CodeMirror.isWordChar(next) && prev != ch && !CodeMirror.isWordChar(prev)) curType = "both";
        else return CodeMirror.Pass;
      } else if (opening && (next.length === 0 || /\s/.test(next) || closeBefore.indexOf(next) > -1)) {
        curType = "both";
      } else {
        return CodeMirror.Pass;
      }
      if (!type) type = curType;
      else if (type != curType) return CodeMirror.Pass;
    }

    var left = pos % 2 ? pairs.charAt(pos - 1) : ch;
    var right = pos % 2 ? ch : pairs.charAt(pos + 1);
    cm.operation(function() {
      if (type == "skip") {
        moveSel(cm, 1)
      } else if (type == "skipThree") {
        moveSel(cm, 3)
      } else if (type == "surround") {
        var sels = cm.getSelections();
        for (var i = 0; i < sels.length; i++)
          sels[i] = left + sels[i] + right;
        cm.replaceSelections(sels, "around");
        sels = cm.listSelections().slice();
        for (var i = 0; i < sels.length; i++)
          sels[i] = contractSelection(sels[i]);
        cm.setSelections(sels);
      } else if (type == "both") {
        cm.replaceSelection(left + right, null);
        cm.triggerElectric(left + right);
        moveSel(cm, -1)
      } else if (type == "addFour") {
        cm.replaceSelection(left + left + left + left, "before");
        moveSel(cm, 1)
      }
    });
  }

  function charsAround(cm, pos) {
    var str = cm.getRange(Pos(pos.line, pos.ch - 1),
      Pos(pos.line, pos.ch + 1));
    return str.length == 2 ? str : null;
  }

  function stringStartsAfter(cm, pos) {
    var token = cm.getTokenAt(Pos(pos.line, pos.ch + 1))
    return /\bstring/.test(token.type) && token.start == pos.ch &&
      (pos.ch == 0 || !/\bstring/.test(cm.getTokenTypeAt(pos)))
  }
});


// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  var ie_lt8 = /MSIE \d/.test(navigator.userAgent) &&
    (document.documentMode == null || document.documentMode < 8);

  var Pos = CodeMirror.Pos;

  var matching = {"(": ")>", ")": "(<", "[": "]>", "]": "[<", "{": "}>", "}": "{<", "<": ">>", ">": "<<"};

  function bracketRegex(config) {
    return config && config.bracketRegex || /[(){}[\]]/
  }

  function findMatchingBracket(cm, where, config) {
    var line = cm.getLineHandle(where.line), pos = where.ch - 1;
    var afterCursor = config && config.afterCursor
    if (afterCursor == null)
      afterCursor = /(^| )cm-fat-cursor($| )/.test(cm.getWrapperElement().className)
    var re = bracketRegex(config)

    // A cursor is defined as between two characters, but in vim command mode
    // (i.e. not insert mode), the cursor is visually represented as a
    // highlighted box on top of the 2nd character. Otherwise, we allow matches
    // from before or after the cursor.
    var match = (!afterCursor && pos >= 0 && re.test(line.text.charAt(pos)) && matching[line.text.charAt(pos)]) ||
      re.test(line.text.charAt(pos + 1)) && matching[line.text.charAt(++pos)];
    if (!match) return null;
    var dir = match.charAt(1) == ">" ? 1 : -1;
    if (config && config.strict && (dir > 0) != (pos == where.ch)) return null;
    var style = cm.getTokenTypeAt(Pos(where.line, pos + 1));

    var found = scanForBracket(cm, Pos(where.line, pos + (dir > 0 ? 1 : 0)), dir, style, config);
    if (found == null) return null;
    return {from: Pos(where.line, pos), to: found && found.pos,
      match: found && found.ch == match.charAt(0), forward: dir > 0};
  }

  // bracketRegex is used to specify which type of bracket to scan
  // should be a regexp, e.g. /[[\]]/
  //
  // Note: If "where" is on an open bracket, then this bracket is ignored.
  //
  // Returns false when no bracket was found, null when it reached
  // maxScanLines and gave up
  function scanForBracket(cm, where, dir, style, config) {
    var maxScanLen = (config && config.maxScanLineLength) || 10000;
    var maxScanLines = (config && config.maxScanLines) || 1000;

    var stack = [];
    var re = bracketRegex(config)
    var lineEnd = dir > 0 ? Math.min(where.line + maxScanLines, cm.lastLine() + 1)
      : Math.max(cm.firstLine() - 1, where.line - maxScanLines);
    for (var lineNo = where.line; lineNo != lineEnd; lineNo += dir) {
      var line = cm.getLine(lineNo);
      if (!line) continue;
      var pos = dir > 0 ? 0 : line.length - 1, end = dir > 0 ? line.length : -1;
      if (line.length > maxScanLen) continue;
      if (lineNo == where.line) pos = where.ch - (dir < 0 ? 1 : 0);
      for (; pos != end; pos += dir) {
        var ch = line.charAt(pos);
        if (re.test(ch) && (style === undefined ||
          (cm.getTokenTypeAt(Pos(lineNo, pos + 1)) || "") == (style || ""))) {
          var match = matching[ch];
          if (match && (match.charAt(1) == ">") == (dir > 0)) stack.push(ch);
          else if (!stack.length) return {pos: Pos(lineNo, pos), ch: ch};
          else stack.pop();
        }
      }
    }
    return lineNo - dir == (dir > 0 ? cm.lastLine() : cm.firstLine()) ? false : null;
  }

  function matchBrackets(cm, autoclear, config) {
    // Disable brace matching in long lines, since it'll cause hugely slow updates
    var maxHighlightLen = cm.state.matchBrackets.maxHighlightLineLength || 1000,
      highlightNonMatching = config && config.highlightNonMatching;
    var marks = [], ranges = cm.listSelections();
    for (var i = 0; i < ranges.length; i++) {
      var match = ranges[i].empty() && findMatchingBracket(cm, ranges[i].head, config);
      if (match && (match.match || highlightNonMatching !== false) && cm.getLine(match.from.line).length <= maxHighlightLen) {
        var style = match.match ? "CodeMirror-matchingbracket" : "CodeMirror-nonmatchingbracket";
        marks.push(cm.markText(match.from, Pos(match.from.line, match.from.ch + 1), {className: style}));
        if (match.to && cm.getLine(match.to.line).length <= maxHighlightLen)
          marks.push(cm.markText(match.to, Pos(match.to.line, match.to.ch + 1), {className: style}));
      }
    }

    if (marks.length) {
      // Kludge to work around the IE bug from issue #1193, where text
      // input stops going to the textarea whenever this fires.
      if (ie_lt8 && cm.state.focused) cm.focus();

      var clear = function() {
        cm.operation(function() {
          for (var i = 0; i < marks.length; i++) marks[i].clear();
        });
      };
      if (autoclear) setTimeout(clear, 800);
      else return clear;
    }
  }

  function doMatchBrackets(cm) {
    cm.operation(function() {
      if (cm.state.matchBrackets.currentlyHighlighted) {
        cm.state.matchBrackets.currentlyHighlighted();
        cm.state.matchBrackets.currentlyHighlighted = null;
      }
      cm.state.matchBrackets.currentlyHighlighted = matchBrackets(cm, false, cm.state.matchBrackets);
    });
  }

  function clearHighlighted(cm) {
    if (cm.state.matchBrackets && cm.state.matchBrackets.currentlyHighlighted) {
      cm.state.matchBrackets.currentlyHighlighted();
      cm.state.matchBrackets.currentlyHighlighted = null;
    }
  }

  CodeMirror.defineOption("matchBrackets", false, function(cm, val, old) {
    if (old && old != CodeMirror.Init) {
      cm.off("cursorActivity", doMatchBrackets);
      cm.off("focus", doMatchBrackets)
      cm.off("blur", clearHighlighted)
      clearHighlighted(cm);
    }
    if (val) {
      cm.state.matchBrackets = typeof val == "object" ? val : {};
      cm.on("cursorActivity", doMatchBrackets);
      cm.on("focus", doMatchBrackets)
      cm.on("blur", clearHighlighted)
    }
  });

  CodeMirror.defineExtension("matchBrackets", function() {matchBrackets(this, true);});
  CodeMirror.defineExtension("findMatchingBracket", function(pos, config, oldConfig){
    // Backwards-compatibility kludge
    if (oldConfig || typeof config == "boolean") {
      if (!oldConfig) {
        config = config ? {strict: true} : null
      } else {
        oldConfig.strict = config
        config = oldConfig
      }
    }
    return findMatchingBracket(this, pos, config)
  });
  CodeMirror.defineExtension("scanForBracket", function(pos, dir, style, config){
    return scanForBracket(this, pos, dir, style, config);
  });
});


// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("./foldcode"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "./foldcode"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  CodeMirror.defineOption("foldGutter", false, function(cm, val, old) {
    if (old && old != CodeMirror.Init) {
      cm.clearGutter(cm.state.foldGutter.options.gutter);
      cm.state.foldGutter = null;
      cm.off("gutterClick", onGutterClick);
      cm.off("changes", onChange);
      cm.off("viewportChange", onViewportChange);
      cm.off("fold", onFold);
      cm.off("unfold", onFold);
      cm.off("swapDoc", onChange);
      cm.off("optionChange", optionChange);
    }
    if (val) {
      cm.state.foldGutter = new State(parseOptions(val));
      updateInViewport(cm);
      cm.on("gutterClick", onGutterClick);
      cm.on("changes", onChange);
      cm.on("viewportChange", onViewportChange);
      cm.on("fold", onFold);
      cm.on("unfold", onFold);
      cm.on("swapDoc", onChange);
      cm.on("optionChange", optionChange);
    }
  });

  var Pos = CodeMirror.Pos;

  function State(options) {
    this.options = options;
    this.from = this.to = 0;
  }

  function parseOptions(opts) {
    if (opts === true) opts = {};
    if (opts.gutter == null) opts.gutter = "CodeMirror-foldgutter";
    if (opts.indicatorOpen == null) opts.indicatorOpen = "CodeMirror-foldgutter-open";
    if (opts.indicatorFolded == null) opts.indicatorFolded = "CodeMirror-foldgutter-folded";
    return opts;
  }

  function isFolded(cm, line) {
    var marks = cm.findMarks(Pos(line, 0), Pos(line + 1, 0));
    for (var i = 0; i < marks.length; ++i) {
      if (marks[i].__isFold) {
        var fromPos = marks[i].find(-1);
        if (fromPos && fromPos.line === line)
          return marks[i];
      }
    }
  }

  function marker(spec) {
    if (typeof spec == "string") {
      var elt = document.createElement("div");
      elt.className = spec + " CodeMirror-guttermarker-subtle";
      return elt;
    } else {
      return spec.cloneNode(true);
    }
  }

  function updateFoldInfo(cm, from, to) {
    var opts = cm.state.foldGutter.options, cur = from - 1;
    var minSize = cm.foldOption(opts, "minFoldSize");
    var func = cm.foldOption(opts, "rangeFinder");
    // we can reuse the built-in indicator element if its className matches the new state
    var clsFolded = typeof opts.indicatorFolded == "string" && classTest(opts.indicatorFolded);
    var clsOpen = typeof opts.indicatorOpen == "string" && classTest(opts.indicatorOpen);
    cm.eachLine(from, to, function(line) {
      ++cur;
      var mark = null;
      var old = line.gutterMarkers;
      if (old) old = old[opts.gutter];
      if (isFolded(cm, cur)) {
        if (clsFolded && old && clsFolded.test(old.className)) return;
        mark = marker(opts.indicatorFolded);
      } else {
        var pos = Pos(cur, 0);
        var range = func && func(cm, pos);
        if (range && range.to.line - range.from.line >= minSize) {
          if (clsOpen && old && clsOpen.test(old.className)) return;
          mark = marker(opts.indicatorOpen);
        }
      }
      if (!mark && !old) return;
      cm.setGutterMarker(line, opts.gutter, mark);
    });
  }

  // copied from CodeMirror/src/util/dom.js
  function classTest(cls) { return new RegExp("(^|\\s)" + cls + "(?:$|\\s)\\s*") }

  function updateInViewport(cm) {
    var vp = cm.getViewport(), state = cm.state.foldGutter;
    if (!state) return;
    cm.operation(function() {
      updateFoldInfo(cm, vp.from, vp.to);
    });
    state.from = vp.from; state.to = vp.to;
  }

  function onGutterClick(cm, line, gutter) {
    var state = cm.state.foldGutter;
    if (!state) return;
    var opts = state.options;
    if (gutter != opts.gutter) return;
    var folded = isFolded(cm, line);
    if (folded) folded.clear();
    else cm.foldCode(Pos(line, 0), opts);
  }

  function optionChange(cm, option) {
    if (option == "mode") onChange(cm)
  }

  function onChange(cm) {
    var state = cm.state.foldGutter;
    if (!state) return;
    var opts = state.options;
    state.from = state.to = 0;
    clearTimeout(state.changeUpdate);
    state.changeUpdate = setTimeout(function() { updateInViewport(cm); }, opts.foldOnChangeTimeSpan || 600);
  }

  function onViewportChange(cm) {
    var state = cm.state.foldGutter;
    if (!state) return;
    var opts = state.options;
    clearTimeout(state.changeUpdate);
    state.changeUpdate = setTimeout(function() {
      var vp = cm.getViewport();
      if (state.from == state.to || vp.from - state.to > 20 || state.from - vp.to > 20) {
        updateInViewport(cm);
      } else {
        cm.operation(function() {
          if (vp.from < state.from) {
            updateFoldInfo(cm, vp.from, state.from);
            state.from = vp.from;
          }
          if (vp.to > state.to) {
            updateFoldInfo(cm, state.to, vp.to);
            state.to = vp.to;
          }
        });
      }
    }, opts.updateViewportTimeSpan || 400);
  }

  function onFold(cm, from) {
    var state = cm.state.foldGutter;
    if (!state) return;
    var line = from.line;
    if (line >= state.from && line < state.to)
      updateFoldInfo(cm, line, line + 1);
  }
});


// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  function bracketFolding(pairs) {
    return function(cm, start) {
      var line = start.line, lineText = cm.getLine(line);

      function findOpening(pair) {
        var tokenType;
        for (var at = start.ch, pass = 0;;) {
          var found = at <= 0 ? -1 : lineText.lastIndexOf(pair[0], at - 1);
          if (found == -1) {
            if (pass == 1) break;
            pass = 1;
            at = lineText.length;
            continue;
          }
          if (pass == 1 && found < start.ch) break;
          tokenType = cm.getTokenTypeAt(CodeMirror.Pos(line, found + 1));
          if (!/^(comment|string)/.test(tokenType)) return {ch: found + 1, tokenType: tokenType, pair: pair};
          at = found - 1;
        }
      }

      function findRange(found) {
        var count = 1, lastLine = cm.lastLine(), end, startCh = found.ch, endCh
        outer: for (var i = line; i <= lastLine; ++i) {
          var text = cm.getLine(i), pos = i == line ? startCh : 0;
          for (;;) {
            var nextOpen = text.indexOf(found.pair[0], pos), nextClose = text.indexOf(found.pair[1], pos);
            if (nextOpen < 0) nextOpen = text.length;
            if (nextClose < 0) nextClose = text.length;
            pos = Math.min(nextOpen, nextClose);
            if (pos == text.length) break;
            if (cm.getTokenTypeAt(CodeMirror.Pos(i, pos + 1)) == found.tokenType) {
              if (pos == nextOpen) ++count;
              else if (!--count) { end = i; endCh = pos; break outer; }
            }
            ++pos;
          }
        }

        if (end == null || line == end) return null
        return {from: CodeMirror.Pos(line, startCh),
          to: CodeMirror.Pos(end, endCh)};
      }

      var found = []
      for (var i = 0; i < pairs.length; i++) {
        var open = findOpening(pairs[i])
        if (open) found.push(open)
      }
      found.sort(function(a, b) { return a.ch - b.ch })
      for (var i = 0; i < found.length; i++) {
        var range = findRange(found[i])
        if (range) return range
      }
      return null
    }
  }

  CodeMirror.registerHelper("fold", "brace", bracketFolding([["{", "}"], ["[", "]"]]));

  CodeMirror.registerHelper("fold", "brace-paren", bracketFolding([["{", "}"], ["[", "]"], ["(", ")"]]));

  CodeMirror.registerHelper("fold", "import", function(cm, start) {
    function hasImport(line) {
      if (line < cm.firstLine() || line > cm.lastLine()) return null;
      var start = cm.getTokenAt(CodeMirror.Pos(line, 1));
      if (!/\S/.test(start.string)) start = cm.getTokenAt(CodeMirror.Pos(line, start.end + 1));
      if (start.type != "keyword" || start.string != "import") return null;
      // Now find closing semicolon, return its position
      for (var i = line, e = Math.min(cm.lastLine(), line + 10); i <= e; ++i) {
        var text = cm.getLine(i), semi = text.indexOf(";");
        if (semi != -1) return {startCh: start.end, end: CodeMirror.Pos(i, semi)};
      }
    }

    var startLine = start.line, has = hasImport(startLine), prev;
    if (!has || hasImport(startLine - 1) || ((prev = hasImport(startLine - 2)) && prev.end.line == startLine - 1))
      return null;
    for (var end = has.end;;) {
      var next = hasImport(end.line + 1);
      if (next == null) break;
      end = next.end;
    }
    return {from: cm.clipPos(CodeMirror.Pos(startLine, has.startCh + 1)), to: end};
  });

  CodeMirror.registerHelper("fold", "include", function(cm, start) {
    function hasInclude(line) {
      if (line < cm.firstLine() || line > cm.lastLine()) return null;
      var start = cm.getTokenAt(CodeMirror.Pos(line, 1));
      if (!/\S/.test(start.string)) start = cm.getTokenAt(CodeMirror.Pos(line, start.end + 1));
      if (start.type == "meta" && start.string.slice(0, 8) == "#include") return start.start + 8;
    }

    var startLine = start.line, has = hasInclude(startLine);
    if (has == null || hasInclude(startLine - 1) != null) return null;
    for (var end = startLine;;) {
      var next = hasInclude(end + 1);
      if (next == null) break;
      ++end;
    }
    return {from: CodeMirror.Pos(startLine, has + 1),
      to: cm.clipPos(CodeMirror.Pos(end))};
  });

});


// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  function Bar(cls, orientation, scroll) {
    this.orientation = orientation;
    this.scroll = scroll;
    this.screen = this.total = this.size = 1;
    this.pos = 0;

    this.node = document.createElement("div");
    this.node.className = cls + "-" + orientation;
    this.inner = this.node.appendChild(document.createElement("div"));

    var self = this;
    CodeMirror.on(this.inner, "mousedown", function(e) {
      if (e.which != 1) return;
      CodeMirror.e_preventDefault(e);
      var axis = self.orientation == "horizontal" ? "pageX" : "pageY";
      var start = e[axis], startpos = self.pos;
      function done() {
        CodeMirror.off(document, "mousemove", move);
        CodeMirror.off(document, "mouseup", done);
      }
      function move(e) {
        if (e.which != 1) return done();
        self.moveTo(startpos + (e[axis] - start) * (self.total / self.size));
      }
      CodeMirror.on(document, "mousemove", move);
      CodeMirror.on(document, "mouseup", done);
    });

    CodeMirror.on(this.node, "click", function(e) {
      CodeMirror.e_preventDefault(e);
      var innerBox = self.inner.getBoundingClientRect(), where;
      if (self.orientation == "horizontal")
        where = e.clientX < innerBox.left ? -1 : e.clientX > innerBox.right ? 1 : 0;
      else
        where = e.clientY < innerBox.top ? -1 : e.clientY > innerBox.bottom ? 1 : 0;
      self.moveTo(self.pos + where * self.screen);
    });

    function onWheel(e) {
      var moved = CodeMirror.wheelEventPixels(e)[self.orientation == "horizontal" ? "x" : "y"];
      var oldPos = self.pos;
      self.moveTo(self.pos + moved);
      if (self.pos != oldPos) CodeMirror.e_preventDefault(e);
    }
    CodeMirror.on(this.node, "mousewheel", onWheel);
    CodeMirror.on(this.node, "DOMMouseScroll", onWheel);
  }

  Bar.prototype.setPos = function(pos, force) {
    if (pos < 0) pos = 0;
    if (pos > this.total - this.screen) pos = this.total - this.screen;
    if (!force && pos == this.pos) return false;
    this.pos = pos;
    this.inner.style[this.orientation == "horizontal" ? "left" : "top"] =
      (pos * (this.size / this.total)) + "px";
    return true
  };

  Bar.prototype.moveTo = function(pos) {
    if (this.setPos(pos)) this.scroll(pos, this.orientation);
  }

  var minButtonSize = 10;

  Bar.prototype.update = function(scrollSize, clientSize, barSize) {
    var sizeChanged = this.screen != clientSize || this.total != scrollSize || this.size != barSize
    if (sizeChanged) {
      this.screen = clientSize;
      this.total = scrollSize;
      this.size = barSize;
    }

    var buttonSize = this.screen * (this.size / this.total);
    if (buttonSize < minButtonSize) {
      this.size -= minButtonSize - buttonSize;
      buttonSize = minButtonSize;
    }
    this.inner.style[this.orientation == "horizontal" ? "width" : "height"] =
      buttonSize + "px";
    this.setPos(this.pos, sizeChanged);
  };

  function SimpleScrollbars(cls, place, scroll) {
    this.addClass = cls;
    this.horiz = new Bar(cls, "horizontal", scroll);
    place(this.horiz.node);
    this.vert = new Bar(cls, "vertical", scroll);
    place(this.vert.node);
    this.width = null;
  }

  SimpleScrollbars.prototype.update = function(measure) {
    if (this.width == null) {
      var style = window.getComputedStyle ? window.getComputedStyle(this.horiz.node) : this.horiz.node.currentStyle;
      if (style) this.width = parseInt(style.height);
    }
    var width = this.width || 0;

    var needsH = measure.scrollWidth > measure.clientWidth + 1;
    var needsV = measure.scrollHeight > measure.clientHeight + 1;
    this.vert.node.style.display = needsV ? "block" : "none";
    this.horiz.node.style.display = needsH ? "block" : "none";

    if (needsV) {
      this.vert.update(measure.scrollHeight, measure.clientHeight,
        measure.viewHeight - (needsH ? width : 0));
      this.vert.node.style.bottom = needsH ? width + "px" : "0";
    }
    if (needsH) {
      this.horiz.update(measure.scrollWidth, measure.clientWidth,
        measure.viewWidth - (needsV ? width : 0) - measure.barLeft);
      this.horiz.node.style.right = needsV ? width + "px" : "0";
      this.horiz.node.style.left = measure.barLeft + "px";
    }

    return {right: needsV ? width : 0, bottom: needsH ? width : 0};
  };

  SimpleScrollbars.prototype.setScrollTop = function(pos) {
    this.vert.setPos(pos);
  };

  SimpleScrollbars.prototype.setScrollLeft = function(pos) {
    this.horiz.setPos(pos);
  };

  SimpleScrollbars.prototype.clear = function() {
    var parent = this.horiz.node.parentNode;
    parent.removeChild(this.horiz.node);
    parent.removeChild(this.vert.node);
  };

  CodeMirror.scrollbarModel.simple = function(place, scroll) {
    return new SimpleScrollbars("CodeMirror-simplescroll", place, scroll);
  };
  CodeMirror.scrollbarModel.overlay = function(place, scroll) {
    return new SimpleScrollbars("CodeMirror-overlayscroll", place, scroll);
  };
});


// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"))
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod)
  else // Plain browser env
    mod(CodeMirror)
})(function(CodeMirror) {
  "use strict"
  var Pos = CodeMirror.Pos

  function regexpFlags(regexp) {
    var flags = regexp.flags
    return flags != null ? flags : (regexp.ignoreCase ? "i" : "")
      + (regexp.global ? "g" : "")
      + (regexp.multiline ? "m" : "")
  }

  function ensureFlags(regexp, flags) {
    var current = regexpFlags(regexp), target = current
    for (var i = 0; i < flags.length; i++) if (target.indexOf(flags.charAt(i)) == -1)
      target += flags.charAt(i)
    return current == target ? regexp : new RegExp(regexp.source, target)
  }

  function maybeMultiline(regexp) {
    return /\\s|\\n|\n|\\W|\\D|\[\^/.test(regexp.source)
  }

  function searchRegexpForward(doc, regexp, start) {
    regexp = ensureFlags(regexp, "g")
    for (var line = start.line, ch = start.ch, last = doc.lastLine(); line <= last; line++, ch = 0) {
      regexp.lastIndex = ch
      var string = doc.getLine(line), match = regexp.exec(string)
      if (match)
        return {from: Pos(line, match.index),
          to: Pos(line, match.index + match[0].length),
          match: match}
    }
  }

  function searchRegexpForwardMultiline(doc, regexp, start) {
    if (!maybeMultiline(regexp)) return searchRegexpForward(doc, regexp, start)

    regexp = ensureFlags(regexp, "gm")
    var string, chunk = 1
    for (var line = start.line, last = doc.lastLine(); line <= last;) {
      // This grows the search buffer in exponentially-sized chunks
      // between matches, so that nearby matches are fast and don't
      // require concatenating the whole document (in case we're
      // searching for something that has tons of matches), but at the
      // same time, the amount of retries is limited.
      for (var i = 0; i < chunk; i++) {
        if (line > last) break
        var curLine = doc.getLine(line++)
        string = string == null ? curLine : string + "\n" + curLine
      }
      chunk = chunk * 2
      regexp.lastIndex = start.ch
      var match = regexp.exec(string)
      if (match) {
        var before = string.slice(0, match.index).split("\n"), inside = match[0].split("\n")
        var startLine = start.line + before.length - 1, startCh = before[before.length - 1].length
        return {from: Pos(startLine, startCh),
          to: Pos(startLine + inside.length - 1,
            inside.length == 1 ? startCh + inside[0].length : inside[inside.length - 1].length),
          match: match}
      }
    }
  }

  function lastMatchIn(string, regexp, endMargin) {
    var match, from = 0
    while (from <= string.length) {
      regexp.lastIndex = from
      var newMatch = regexp.exec(string)
      if (!newMatch) break
      var end = newMatch.index + newMatch[0].length
      if (end > string.length - endMargin) break
      if (!match || end > match.index + match[0].length)
        match = newMatch
      from = newMatch.index + 1
    }
    return match
  }

  function searchRegexpBackward(doc, regexp, start) {
    regexp = ensureFlags(regexp, "g")
    for (var line = start.line, ch = start.ch, first = doc.firstLine(); line >= first; line--, ch = -1) {
      var string = doc.getLine(line)
      var match = lastMatchIn(string, regexp, ch < 0 ? 0 : string.length - ch)
      if (match)
        return {from: Pos(line, match.index),
          to: Pos(line, match.index + match[0].length),
          match: match}
    }
  }

  function searchRegexpBackwardMultiline(doc, regexp, start) {
    if (!maybeMultiline(regexp)) return searchRegexpBackward(doc, regexp, start)
    regexp = ensureFlags(regexp, "gm")
    var string, chunkSize = 1, endMargin = doc.getLine(start.line).length - start.ch
    for (var line = start.line, first = doc.firstLine(); line >= first;) {
      for (var i = 0; i < chunkSize && line >= first; i++) {
        var curLine = doc.getLine(line--)
        string = string == null ? curLine : curLine + "\n" + string
      }
      chunkSize *= 2

      var match = lastMatchIn(string, regexp, endMargin)
      if (match) {
        var before = string.slice(0, match.index).split("\n"), inside = match[0].split("\n")
        var startLine = line + before.length, startCh = before[before.length - 1].length
        return {from: Pos(startLine, startCh),
          to: Pos(startLine + inside.length - 1,
            inside.length == 1 ? startCh + inside[0].length : inside[inside.length - 1].length),
          match: match}
      }
    }
  }

  var doFold, noFold
  if (String.prototype.normalize) {
    doFold = function(str) { return str.normalize("NFD").toLowerCase() }
    noFold = function(str) { return str.normalize("NFD") }
  } else {
    doFold = function(str) { return str.toLowerCase() }
    noFold = function(str) { return str }
  }

  // Maps a position in a case-folded line back to a position in the original line
  // (compensating for codepoints increasing in number during folding)
  function adjustPos(orig, folded, pos, foldFunc) {
    if (orig.length == folded.length) return pos
    for (var min = 0, max = pos + Math.max(0, orig.length - folded.length);;) {
      if (min == max) return min
      var mid = (min + max) >> 1
      var len = foldFunc(orig.slice(0, mid)).length
      if (len == pos) return mid
      else if (len > pos) max = mid
      else min = mid + 1
    }
  }

  function searchStringForward(doc, query, start, caseFold) {
    // Empty string would match anything and never progress, so we
    // define it to match nothing instead.
    if (!query.length) return null
    var fold = caseFold ? doFold : noFold
    var lines = fold(query).split(/\r|\n\r?/)

    search: for (var line = start.line, ch = start.ch, last = doc.lastLine() + 1 - lines.length; line <= last; line++, ch = 0) {
      var orig = doc.getLine(line).slice(ch), string = fold(orig)
      if (lines.length == 1) {
        var found = string.indexOf(lines[0])
        if (found == -1) continue search
        var start = adjustPos(orig, string, found, fold) + ch
        return {from: Pos(line, adjustPos(orig, string, found, fold) + ch),
          to: Pos(line, adjustPos(orig, string, found + lines[0].length, fold) + ch)}
      } else {
        var cutFrom = string.length - lines[0].length
        if (string.slice(cutFrom) != lines[0]) continue search
        for (var i = 1; i < lines.length - 1; i++)
          if (fold(doc.getLine(line + i)) != lines[i]) continue search
        var end = doc.getLine(line + lines.length - 1), endString = fold(end), lastLine = lines[lines.length - 1]
        if (endString.slice(0, lastLine.length) != lastLine) continue search
        return {from: Pos(line, adjustPos(orig, string, cutFrom, fold) + ch),
          to: Pos(line + lines.length - 1, adjustPos(end, endString, lastLine.length, fold))}
      }
    }
  }

  function searchStringBackward(doc, query, start, caseFold) {
    if (!query.length) return null
    var fold = caseFold ? doFold : noFold
    var lines = fold(query).split(/\r|\n\r?/)

    search: for (var line = start.line, ch = start.ch, first = doc.firstLine() - 1 + lines.length; line >= first; line--, ch = -1) {
      var orig = doc.getLine(line)
      if (ch > -1) orig = orig.slice(0, ch)
      var string = fold(orig)
      if (lines.length == 1) {
        var found = string.lastIndexOf(lines[0])
        if (found == -1) continue search
        return {from: Pos(line, adjustPos(orig, string, found, fold)),
          to: Pos(line, adjustPos(orig, string, found + lines[0].length, fold))}
      } else {
        var lastLine = lines[lines.length - 1]
        if (string.slice(0, lastLine.length) != lastLine) continue search
        for (var i = 1, start = line - lines.length + 1; i < lines.length - 1; i++)
          if (fold(doc.getLine(start + i)) != lines[i]) continue search
        var top = doc.getLine(line + 1 - lines.length), topString = fold(top)
        if (topString.slice(topString.length - lines[0].length) != lines[0]) continue search
        return {from: Pos(line + 1 - lines.length, adjustPos(top, topString, top.length - lines[0].length, fold)),
          to: Pos(line, adjustPos(orig, string, lastLine.length, fold))}
      }
    }
  }

  function SearchCursor(doc, query, pos, options) {
    this.atOccurrence = false
    this.afterEmptyMatch = false
    this.doc = doc
    pos = pos ? doc.clipPos(pos) : Pos(0, 0)
    this.pos = {from: pos, to: pos}

    var caseFold
    if (typeof options == "object") {
      caseFold = options.caseFold
    } else { // Backwards compat for when caseFold was the 4th argument
      caseFold = options
      options = null
    }

    if (typeof query == "string") {
      if (caseFold == null) caseFold = false
      this.matches = function(reverse, pos) {
        return (reverse ? searchStringBackward : searchStringForward)(doc, query, pos, caseFold)
      }
    } else {
      query = ensureFlags(query, "gm")
      if (!options || options.multiline !== false)
        this.matches = function(reverse, pos) {
          return (reverse ? searchRegexpBackwardMultiline : searchRegexpForwardMultiline)(doc, query, pos)
        }
      else
        this.matches = function(reverse, pos) {
          return (reverse ? searchRegexpBackward : searchRegexpForward)(doc, query, pos)
        }
    }
  }

  SearchCursor.prototype = {
    findNext: function() {return this.find(false)},
    findPrevious: function() {return this.find(true)},

    find: function(reverse) {
      var head = this.doc.clipPos(reverse ? this.pos.from : this.pos.to);
      if (this.afterEmptyMatch && this.atOccurrence) {
        // do not return the same 0 width match twice
        head = Pos(head.line, head.ch)
        if (reverse) {
          head.ch--;
          if (head.ch < 0) {
            head.line--;
            head.ch = (this.doc.getLine(head.line) || "").length;
          }
        } else {
          head.ch++;
          if (head.ch > (this.doc.getLine(head.line) || "").length) {
            head.ch = 0;
            head.line++;
          }
        }
        if (CodeMirror.cmpPos(head, this.doc.clipPos(head)) != 0) {
          return this.atOccurrence = false
        }
      }
      var result = this.matches(reverse, head)
      this.afterEmptyMatch = result && CodeMirror.cmpPos(result.from, result.to) == 0

      if (result) {
        this.pos = result
        this.atOccurrence = true
        return this.pos.match || true
      } else {
        var end = Pos(reverse ? this.doc.firstLine() : this.doc.lastLine() + 1, 0)
        this.pos = {from: end, to: end}
        return this.atOccurrence = false
      }
    },

    from: function() {if (this.atOccurrence) return this.pos.from},
    to: function() {if (this.atOccurrence) return this.pos.to},

    replace: function(newText, origin) {
      if (!this.atOccurrence) return
      var lines = CodeMirror.splitLines(newText)
      this.doc.replaceRange(lines, this.pos.from, this.pos.to, origin)
      this.pos.to = Pos(this.pos.from.line + lines.length - 1,
        lines[lines.length - 1].length + (lines.length == 1 ? this.pos.from.ch : 0))
    }
  }

  CodeMirror.defineExtension("getSearchCursor", function(query, pos, caseFold) {
    return new SearchCursor(this.doc, query, pos, caseFold)
  })
  CodeMirror.defineDocExtension("getSearchCursor", function(query, pos, caseFold) {
    return new SearchCursor(this, query, pos, caseFold)
  })

  CodeMirror.defineExtension("selectMatches", function(query, caseFold) {
    var ranges = []
    var cur = this.getSearchCursor(query, this.getCursor("from"), caseFold)
    while (cur.findNext()) {
      if (CodeMirror.cmpPos(cur.to(), this.getCursor("to")) > 0) break
      ranges.push({anchor: cur.from(), head: cur.to()})
    }
    if (ranges.length)
      this.setSelections(ranges, 0)
  })
});


// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE

// Highlighting text that matches the selection
//
// Defines an option highlightSelectionMatches, which, when enabled,
// will style strings that match the selection throughout the
// document.
//
// The option can be set to true to simply enable it, or to a
// {minChars, style, wordsOnly, showToken, delay} object to explicitly
// configure it. minChars is the minimum amount of characters that should be
// selected for the behavior to occur, and style is the token style to
// apply to the matches. This will be prefixed by "cm-" to create an
// actual CSS class name. If wordsOnly is enabled, the matches will be
// highlighted only if the selected text is a word. showToken, when enabled,
// will cause the current token to be highlighted when nothing is selected.
// delay is used to specify how much time to wait, in milliseconds, before
// highlighting the matches. If annotateScrollbar is enabled, the occurrences
// will be highlighted on the scrollbar via the matchesonscrollbar addon.

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("./matchesonscrollbar"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "./matchesonscrollbar"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  var defaults = {
    style: "matchhighlight",
    minChars: 2,
    delay: 100,
    wordsOnly: false,
    annotateScrollbar: false,
    showToken: false,
    trim: true
  }

  function State(options) {
    this.options = {}
    for (var name in defaults)
      this.options[name] = (options && options.hasOwnProperty(name) ? options : defaults)[name]
    this.overlay = this.timeout = null;
    this.matchesonscroll = null;
    this.active = false;
  }

  CodeMirror.defineOption("highlightSelectionMatches", false, function(cm, val, old) {
    if (old && old != CodeMirror.Init) {
      removeOverlay(cm);
      clearTimeout(cm.state.matchHighlighter.timeout);
      cm.state.matchHighlighter = null;
      cm.off("cursorActivity", cursorActivity);
      cm.off("focus", onFocus)
    }
    if (val) {
      var state = cm.state.matchHighlighter = new State(val);
      if (cm.hasFocus()) {
        state.active = true
        highlightMatches(cm)
      } else {
        cm.on("focus", onFocus)
      }
      cm.on("cursorActivity", cursorActivity);
    }
  });

  function cursorActivity(cm) {
    var state = cm.state.matchHighlighter;
    if (state.active || cm.hasFocus()) scheduleHighlight(cm, state)
  }

  function onFocus(cm) {
    var state = cm.state.matchHighlighter
    if (!state.active) {
      state.active = true
      scheduleHighlight(cm, state)
    }
  }

  function scheduleHighlight(cm, state) {
    clearTimeout(state.timeout);
    state.timeout = setTimeout(function() {highlightMatches(cm);}, state.options.delay);
  }

  function addOverlay(cm, query, hasBoundary, style) {
    var state = cm.state.matchHighlighter;
    cm.addOverlay(state.overlay = makeOverlay(query, hasBoundary, style));
    if (state.options.annotateScrollbar && cm.showMatchesOnScrollbar) {
      var searchFor = hasBoundary ? new RegExp((/\w/.test(query.charAt(0)) ? "\\b" : "") +
        query.replace(/[\\\[.+*?(){|^$]/g, "\\$&") +
        (/\w/.test(query.charAt(query.length - 1)) ? "\\b" : "")) : query;
      state.matchesonscroll = cm.showMatchesOnScrollbar(searchFor, false,
        {className: "CodeMirror-selection-highlight-scrollbar"});
    }
  }

  function removeOverlay(cm) {
    var state = cm.state.matchHighlighter;
    if (state.overlay) {
      cm.removeOverlay(state.overlay);
      state.overlay = null;
      if (state.matchesonscroll) {
        state.matchesonscroll.clear();
        state.matchesonscroll = null;
      }
    }
  }

  function highlightMatches(cm) {
    cm.operation(function() {
      var state = cm.state.matchHighlighter;
      removeOverlay(cm);
      if (!cm.somethingSelected() && state.options.showToken) {
        var re = state.options.showToken === true ? /[\w$]/ : state.options.showToken;
        var cur = cm.getCursor(), line = cm.getLine(cur.line), start = cur.ch, end = start;
        while (start && re.test(line.charAt(start - 1))) --start;
        while (end < line.length && re.test(line.charAt(end))) ++end;
        if (start < end)
          addOverlay(cm, line.slice(start, end), re, state.options.style);
        return;
      }
      var from = cm.getCursor("from"), to = cm.getCursor("to");
      if (from.line != to.line) return;
      if (state.options.wordsOnly && !isWord(cm, from, to)) return;
      var selection = cm.getRange(from, to)
      if (state.options.trim) selection = selection.replace(/^\s+|\s+$/g, "")
      if (selection.length >= state.options.minChars)
        addOverlay(cm, selection, false, state.options.style);
    });
  }

  function isWord(cm, from, to) {
    var str = cm.getRange(from, to);
    if (str.match(/^\w+$/) !== null) {
      if (from.ch > 0) {
        var pos = {line: from.line, ch: from.ch - 1};
        var chr = cm.getRange(pos, from);
        if (chr.match(/\W/) === null) return false;
      }
      if (to.ch < cm.getLine(from.line).length) {
        var pos = {line: to.line, ch: to.ch + 1};
        var chr = cm.getRange(to, pos);
        if (chr.match(/\W/) === null) return false;
      }
      return true;
    } else return false;
  }

  function boundariesAround(stream, re) {
    return (!stream.start || !re.test(stream.string.charAt(stream.start - 1))) &&
      (stream.pos == stream.string.length || !re.test(stream.string.charAt(stream.pos)));
  }

  function makeOverlay(query, hasBoundary, style) {
    return {token: function(stream) {
        if (stream.match(query) &&
          (!hasBoundary || boundariesAround(stream, hasBoundary)))
          return style;
        stream.next();
        stream.skipTo(query.charAt(0)) || stream.skipToEnd();
      }};
  }
});

