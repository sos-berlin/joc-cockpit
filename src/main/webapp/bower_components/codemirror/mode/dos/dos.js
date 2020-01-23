(function (mod) {
  'use strict';
  if (typeof exports == 'object' && typeof module == 'object') // CommonJS
    mod(require('../../lib/codemirror'));
  else if (typeof define == 'function' && define.amd) // AMD
    define(['../../lib/codemirror'], mod);
  else // Plain browser env
    mod(window.CodeMirror);
})(function (CodeMirror) {
  'use strict';

  CodeMirror.defineMode('dos', function () {
    function buildRegexp(patterns, options) {
      options = options || {};
      var prefix = options.prefix !== undefined ? options.prefix : '^';
      var suffix = options.suffix !== undefined ? options.suffix : '\\b';

      for (var i = 0; i < patterns.length; i++) {
        if (patterns[i] instanceof RegExp) {
          patterns[i] = patterns[i].source;
        } else {
          patterns[i] = patterns[i].replace(/%%[^ ]|%[^ ]+?%|![^ ]+?!/g, '\\$&');
        }
      }

      return new RegExp(prefix + '(' + patterns.join('|') + ')' + suffix, 'i');
    }

    var notCharacterOrDash = '/%%[^ ]|%[^ ]+?%|![^ ]+?!/';
    var varNames = /^\s*[A-Za-z._?][A-Za-z0-9_$#@~.?]*(:|\s+label)/
    var keywords = buildRegexp([
      varNames
    ], {suffix: notCharacterOrDash});

    var identifiers = /^[A-Za-z\_][A-Za-z\-\_\d]*\b/;

    var symbolOperators = /[+*]=|\+\+|[+*=!]|<(?!#)|(?!#)>/;
    var operators = buildRegexp([symbolOperators], { suffix: '' });

    var builtins = buildRegexp([/if|else|goto|for|in|do|call|exit|not|exist|errorlevel|defined|equ|neq|lss|leq|gtr|geq|prn|nul|lpt3|lpt2|lpt1|con|com4|com3|com2|com1|aux|shift|dir|echo|setlocal|endlocal|set|pause|copy|append|assoc|at|attrib|break|cacls|cd|chcp|chdir|chkdsk|chkntfs|cls|cmd|color|comp|compact|convert|date|diskcomp|diskcopy|doskey|erase|fs|find|findstr|format|ftype|graftabl|help|keyb|label|md|mkdir|mode|more|move|path|print|popd|pushd|promt|rd|recover|rem|rename|replace|restore|rmdir|shiftsort|start|subst|time|title|tree|type|ver|verify|vol|ping|net|ipconfig|taskkill|xcopy|ren|del/], {suffix: '(?:$|\\W)'});

    var grammar = {
      keyword: keywords,
      builtin: builtins,
      operator: operators,
      identifier: identifiers
    };

    // tokenizers
    function tokenBase(stream, state) {
      var parent = state.returnStack[state.returnStack.length - 1];
      if (parent && parent.shouldReturnFrom(state)) {
        state.tokenize = parent.tokenize;
        state.returnStack.pop();
        return state.tokenize(stream, state);
      }

      if (stream.eatSpace()) {
        return null;
      }

      if (stream.match(/^\s*@?rem\b/)) {
        stream.start = 0;
        stream.skipToEnd();
        return 'comment';
      }

      if (stream.eat('(')) {
        state.bracketNesting += 1;
        return 'punctuation';
      }

      if (stream.eat(')')) {
        state.bracketNesting -= 1;
        return 'punctuation';
      }

      for (var key in grammar) {
        if (stream.match(grammar[key])) {
          return key;
        }
      }

      var ch = stream.next();

      // single-quote string
      if (ch === "'") {
        return tokenSingleQuoteString(stream, state);
      }
      if (/\d/.test(ch)) {
        stream.eatWhile(/\d/);
        if(stream.eol() || !/\w/.test(stream.peek())) {
          return 'number';
        }
      }

      if (ch === '@') {
        if (stream.eol()) {
          return 'error';
        } else if (stream.peek().match(/[({]/)) {
          return 'punctuation';
        } else if (stream.peek().match(varNames)) {
          return tokenVariable(stream, state);
        } else if (stream.match(/^\s*@?rem\b/i)) {
          stream.start = 1;
          stream.skipToEnd();
          return 'comment';
        }
      }
      if (ch === '@') {
        return 'attribute';
      }

      if (ch === '%') {
        if (stream.match(/\d+/)) {
          stream.eatWhile(/\d+/);
        }
        return 'keyword';
      }

      // double-quote string
      if (ch === '"' && !stream.eat('"')) {
        return tokenDoubleQuoteString(stream, state);
      }

      return '';
    }


    function tokenSingleQuoteString(stream, state) {
      var ch;
      while ((ch = stream.peek()) != null) {
        stream.next();
        if (ch === "'" && !stream.eat("'")) {
          state.tokenize = tokenBase;
          return 'string';
        }
      }
      return 'error';
    }

    function tokenDoubleQuoteString(stream, state) {
      var ch;
      while ((ch = stream.peek()) != null) {
        stream.next();
        if (ch === '%') {
          state.tokenize = tokenStringInterpolation;
          return 'keyword';
        }
        if (ch === '`') {
          stream.next();
          continue;
        }

        if (ch === '"' && !stream.eat('"')) {
          state.tokenize = tokenBase;
          return 'string';
        }
      }
      return '';
    }

    function tokenStringInterpolation(stream, state) {
      return tokenInterpolation(stream, state, tokenDoubleQuoteString);
    }
    function tokenMultiStringReturn(stream, state) {
      state.tokenize = tokenMultiString;
      state.startQuote = '"';
      return tokenMultiString(stream, state);
    }

    function tokenHereStringInterpolation(stream, state) {
      return tokenInterpolation(stream, state, tokenMultiStringReturn);
    }

    function tokenInterpolation(stream, state, parentTokenize) {
      if (stream.match(notCharacterOrDash)) {
        var savedBracketNesting = state.bracketNesting;
        state.returnStack.push({
          /*jshint loopfunc:true */
          shouldReturnFrom: function (state) {
            return state.bracketNesting === savedBracketNesting;
          },
          tokenize: parentTokenize
        });
        state.tokenize = tokenBase;
        state.bracketNesting += 1;
        return 'string';
      } else {
        stream.next();
        state.returnStack.push({
          shouldReturnFrom: function () {
            return true;
          },
          tokenize: parentTokenize
        });
        state.tokenize = tokenVariable;
        stream.start = stream.start-1;
        stream.pos = stream.pos-1;
        return state.tokenize(stream, state);
      }
    }

    function tokenVariable(stream, state) {
      var ch = stream.peek();
      if (stream.eat('(')) {
        state.tokenize = tokenVariableWithBraces;
        return tokenVariableWithBraces(stream, state);
      } else if (ch != undefined && ch.match(varNames)) {
        stream.eatWhile(varNames);
        state.tokenize = tokenBase;
        return 'keyword';
      } else {
        state.tokenize = tokenBase;
        return 'keyword';
      }
    }

    function tokenVariableWithBraces(stream, state) {
      var ch;
      while ((ch = stream.next()) != null) {
        if (ch === '}') {
          state.tokenize = tokenBase;
          break;
        }
      }
      return 'variable-2';
    }

    function tokenMultiString(stream, state) {
      var quote = state.startQuote;
      if (stream.sol() && stream.match(new RegExp(quote + '@'))) {
        state.tokenize = tokenBase;
      } else if (quote === '"') {
        while (!stream.eol()) {
          var ch = stream.peek();
          if (ch === '%' && !stream.eat('%')) {
            state.tokenize = tokenHereStringInterpolation;
            return 'string';
          }

          stream.next();
          if (ch === '`') {
            stream.next();
          }
        }
      } else {
        stream.skipToEnd();
      }

      return 'string';
    }

    return {
      startState: function () {
        return {
          returnStack: [],
          bracketNesting: 0,
          tokenize: tokenBase
        };
      },
      token: function (stream, state) {
        return state.tokenize(stream, state);
      },
      blockCommentStart: '<#',
      blockCommentEnd: '#>',
      lineComment: '#',
      fold: 'brace'
    };
  });

  CodeMirror.defineMIME('application/x-bat', 'dos');
});


