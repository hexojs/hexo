/**
 * Helper to test CodeMirror highlighting modes. It pretty prints output of the
 * highlighter and can check against expected styles.
 *
 * Mode tests are registered by calling test.mode(testName, mode,
 * tokens), where mode is a mode object as returned by
 * CodeMirror.getMode, and tokens is an array of lines that make up
 * the test.
 *
 * These lines are strings, in which styled stretches of code are
 * enclosed in brackets `[]`, and prefixed by their style. For
 * example, `[keyword if]`. Brackets in the code itself must be
 * duplicated to prevent them from being interpreted as token
 * boundaries. For example `a[[i]]` for `a[i]`. If a token has
 * multiple styles, the styles must be separated by ampersands, for
 * example `[tag&error </hmtl>]`.
 *
 * See the test.js files in the css, markdown, gfm, and stex mode
 * directories for examples.
 */
(function() {
  function findSingle(str, pos, ch) {
    for (;;) {
      var found = str.indexOf(ch, pos);
      if (found == -1) return null;
      if (str.charAt(found + 1) != ch) return found;
      pos = found + 2;
    }
  }

  var styleName = /[\w&-_]+/g;
  function parseTokens(strs) {
    var tokens = [], plain = "";
    for (var i = 0; i < strs.length; ++i) {
      if (i) plain += "\n";
      var str = strs[i], pos = 0;
      while (pos < str.length) {
        var style = null, text;
        if (str.charAt(pos) == "[" && str.charAt(pos+1) != "[") {
          styleName.lastIndex = pos + 1;
          var m = styleName.exec(str);
          style = m[0].replace(/&/g, " ");
          var textStart = pos + style.length + 2;
          var end = findSingle(str, textStart, "]");
          if (end == null) throw new Error("Unterminated token at " + pos + " in '" + str + "'" + style);
          text = str.slice(textStart, end);
          pos = end + 1;
        } else {
          var end = findSingle(str, pos, "[");
          if (end == null) end = str.length;
          text = str.slice(pos, end);
          pos = end;
        }
        text = text.replace(/\[\[|\]\]/g, function(s) {return s.charAt(0);});
        tokens.push(style, text);
        plain += text;
      }
    }
    return {tokens: tokens, plain: plain};
  }

  test.mode = function(name, mode, tokens, modeName) {
    var data = parseTokens(tokens);
    return test((modeName || mode.name) + "_" + name, function() {
      return compare(data.plain, data.tokens, mode);
    });
  };

  function compare(text, expected, mode) {

    var expectedOutput = [];
    for (var i = 0; i < expected.length; i += 2) {
      var sty = expected[i];
      if (sty && sty.indexOf(" ")) sty = sty.split(' ').sort().join(' ');
      expectedOutput.push(sty, expected[i + 1]);
    }

    var observedOutput = highlight(text, mode);

    var pass, passStyle = "";
    pass = highlightOutputsEqual(expectedOutput, observedOutput);
    passStyle = pass ? 'mt-pass' : 'mt-fail';

    var s = '';
    if (pass) {
      s += '<div class="mt-test ' + passStyle + '">';
      s +=   '<pre>' + text.replace('&', '&amp;').replace('<', '&lt;') + '</pre>';
      s +=   '<div class="cm-s-default">';
      s +=   prettyPrintOutputTable(observedOutput);
      s +=   '</div>';
      s += '</div>';
      return s;
    } else {
      s += '<div class="mt-test ' + passStyle + '">';
      s +=   '<pre>' + text.replace('&', '&amp;').replace('<', '&lt;') + '</pre>';
      s +=   '<div class="cm-s-default">';
      s += 'expected:';
      s +=   prettyPrintOutputTable(expectedOutput);
      s += 'observed:';
      s +=   prettyPrintOutputTable(observedOutput);
      s +=   '</div>';
      s += '</div>';
      throw s;
    }
  }

  /**
   * Emulation of CodeMirror's internal highlight routine for testing. Multi-line
   * input is supported.
   *
   * @param string to highlight
   *
   * @param mode the mode that will do the actual highlighting
   *
   * @return array of [style, token] pairs
   */
  function highlight(string, mode) {
    var state = mode.startState()

    var lines = string.replace(/\r\n/g,'\n').split('\n');
    var st = [], pos = 0;
    for (var i = 0; i < lines.length; ++i) {
      var line = lines[i], newLine = true;
      var stream = new CodeMirror.StringStream(line);
      if (line == "" && mode.blankLine) mode.blankLine(state);
      /* Start copied code from CodeMirror.highlight */
      while (!stream.eol()) {
        var style = mode.token(stream, state), substr = stream.current();
        if (style && style.indexOf(" ") > -1) style = style.split(' ').sort().join(' ');

        stream.start = stream.pos;
        if (pos && st[pos-2] == style && !newLine) {
          st[pos-1] += substr;
        } else if (substr) {
          st[pos++] = style; st[pos++] = substr;
        }
        // Give up when line is ridiculously long
        if (stream.pos > 5000) {
          st[pos++] = null; st[pos++] = this.text.slice(stream.pos);
          break;
        }
        newLine = false;
      }
    }

    return st;
  }

  /**
   * Compare two arrays of output from highlight.
   *
   * @param o1 array of [style, token] pairs
   *
   * @param o2 array of [style, token] pairs
   *
   * @return boolean; true iff outputs equal
   */
  function highlightOutputsEqual(o1, o2) {
    if (o1.length != o2.length) return false;
    for (var i = 0; i < o1.length; ++i)
      if (o1[i] != o2[i]) return false;
    return true;
  }

  /**
   * Print tokens and corresponding styles in a table. Spaces in the token are
   * replaced with 'interpunct' dots (&middot;).
   *
   * @param output array of [style, token] pairs
   *
   * @return html string
   */
  function prettyPrintOutputTable(output) {
    var s = '<table class="mt-output">';
    s += '<tr>';
    for (var i = 0; i < output.length; i += 2) {
      var style = output[i], val = output[i+1];
      s +=
      '<td class="mt-token">' +
        '<span class="cm-' + String(style).replace(/ +/g, " cm-") + '">' +
        val.replace(/ /g,'\xb7').replace('&', '&amp;').replace('<', '&lt;') +
        '</span>' +
        '</td>';
    }
    s += '</tr><tr>';
    for (var i = 0; i < output.length; i += 2) {
      s += '<td class="mt-style"><span>' + output[i] + '</span></td>';
    }
    s += '</table>';
    return s;
  }
})();
