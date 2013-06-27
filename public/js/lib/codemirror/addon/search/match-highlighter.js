// Highlighting text that matches the selection
//
// Defines an option highlightSelectionMatches, which, when enabled,
// will style strings that match the selection throughout the
// document.
//
// The option can be set to true to simply enable it, or to a
// {minChars, style, showToken} object to explicitly configure it.
// minChars is the minimum amount of characters that should be
// selected for the behavior to occur, and style is the token style to
// apply to the matches. This will be prefixed by "cm-" to create an
// actual CSS class name. showToken, when enabled, will cause the
// current token to be highlighted when nothing is selected.

(function() {
  var DEFAULT_MIN_CHARS = 2;
  var DEFAULT_TOKEN_STYLE = "matchhighlight";

  function State(options) {
    if (typeof options == "object") {
      this.minChars = options.minChars;
      this.style = options.style;
      this.showToken = options.showToken;
    }
    if (this.style == null) this.style = DEFAULT_TOKEN_STYLE;
    if (this.minChars == null) this.minChars = DEFAULT_MIN_CHARS;
    this.overlay = this.timeout = null;
  }

  CodeMirror.defineOption("highlightSelectionMatches", false, function(cm, val, old) {
    if (old && old != CodeMirror.Init) {
      var over = cm.state.matchHighlighter.overlay;
      if (over) cm.removeOverlay(over);
      clearTimeout(cm.state.matchHighlighter.timeout);
      cm.state.matchHighlighter = null;
      cm.off("cursorActivity", cursorActivity);
    }
    if (val) {
      cm.state.matchHighlighter = new State(val);
      highlightMatches(cm);
      cm.on("cursorActivity", cursorActivity);
    }
  });

  function cursorActivity(cm) {
    var state = cm.state.matchHighlighter;
    clearTimeout(state.timeout);
    state.timeout = setTimeout(function() {highlightMatches(cm);}, 100);
  }

  function highlightMatches(cm) {
    cm.operation(function() {
      var state = cm.state.matchHighlighter;
      if (state.overlay) {
        cm.removeOverlay(state.overlay);
        state.overlay = null;
      }

      if (!cm.somethingSelected() && state.showToken) {
        var tok = cm.getTokenAt(cm.getCursor()).string;
        if (/\w/.test(tok))
          cm.addOverlay(state.overlay = makeOverlay(tok, true, state.style));
        return;
      }
      if (cm.getCursor("head").line != cm.getCursor("anchor").line) return;
      var selection = cm.getSelection().replace(/^\s+|\s+$/g, "");
      if (selection.length >= state.minChars)
        cm.addOverlay(state.overlay = makeOverlay(selection, false, state.style));
    });
  }

  function boundariesAround(stream) {
    return (stream.start || /.\b./.test(stream.string.slice(stream.start - 1, stream.start + 1))) &&
      (stream.pos == stream.string.length || /.\b./.test(stream.string.slice(stream.pos - 1, stream.pos + 1)));
  }

  function makeOverlay(query, wordBoundaries, style) {
    return {token: function(stream) {
      if (stream.match(query) &&
          (!wordBoundaries || boundariesAround(stream)))
        return style;
      stream.next();
      stream.skipTo(query.charAt(0)) || stream.skipToEnd();
    }};
  }
})();
