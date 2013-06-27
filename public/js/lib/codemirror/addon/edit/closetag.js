/**
 * Tag-closer extension for CodeMirror.
 *
 * This extension adds an "autoCloseTags" option that can be set to
 * either true to get the default behavior, or an object to further
 * configure its behavior.
 *
 * These are supported options:
 *
 * `whenClosing` (default true)
 *   Whether to autoclose when the '/' of a closing tag is typed.
 * `whenOpening` (default true)
 *   Whether to autoclose the tag when the final '>' of an opening
 *   tag is typed.
 * `dontCloseTags` (default is empty tags for HTML, none for XML)
 *   An array of tag names that should not be autoclosed.
 * `indentTags` (default is block tags for HTML, none for XML)
 *   An array of tag names that should, when opened, cause a
 *   blank line to be added inside the tag, and the blank line and
 *   closing line to be indented.
 *
 * See demos/closetag.html for a usage example.
 */

(function() {
  CodeMirror.defineOption("autoCloseTags", false, function(cm, val, old) {
    if (val && (old == CodeMirror.Init || !old)) {
      var map = {name: "autoCloseTags"};
      if (typeof val != "object" || val.whenClosing)
        map["'/'"] = function(cm) { return autoCloseTag(cm, '/'); };
      if (typeof val != "object" || val.whenOpening)
        map["'>'"] = function(cm) { return autoCloseTag(cm, '>'); };
      cm.addKeyMap(map);
    } else if (!val && (old != CodeMirror.Init && old)) {
      cm.removeKeyMap("autoCloseTags");
    }
  });

  var htmlDontClose = ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param",
                       "source", "track", "wbr"];
  var htmlIndent = ["applet", "blockquote", "body", "button", "div", "dl", "fieldset", "form", "frameset", "h1", "h2", "h3", "h4",
                    "h5", "h6", "head", "html", "iframe", "layer", "legend", "object", "ol", "p", "select", "table", "ul"];

  function autoCloseTag(cm, ch) {
    var pos = cm.getCursor(), tok = cm.getTokenAt(pos);
    var inner = CodeMirror.innerMode(cm.getMode(), tok.state), state = inner.state;
    if (inner.mode.name != "xml") return CodeMirror.Pass;

    var opt = cm.getOption("autoCloseTags"), html = inner.mode.configuration == "html";
    var dontCloseTags = (typeof opt == "object" && opt.dontCloseTags) || (html && htmlDontClose);
    var indentTags = (typeof opt == "object" && opt.indentTags) || (html && htmlIndent);

    if (ch == ">" && state.tagName) {
      var tagName = state.tagName;
      if (tok.end > pos.ch) tagName = tagName.slice(0, tagName.length - tok.end + pos.ch);
      var lowerTagName = tagName.toLowerCase();
      // Don't process the '>' at the end of an end-tag or self-closing tag
      if (tok.type == "tag" && state.type == "closeTag" ||
          tok.string.indexOf("/") == (tok.string.length - 1) || // match something like <someTagName />
          dontCloseTags && indexOf(dontCloseTags, lowerTagName) > -1)
        return CodeMirror.Pass;

      var doIndent = indentTags && indexOf(indentTags, lowerTagName) > -1;
      var curPos = doIndent ? CodeMirror.Pos(pos.line + 1, 0) : CodeMirror.Pos(pos.line, pos.ch + 1);
      cm.replaceSelection(">" + (doIndent ? "\n\n" : "") + "</" + tagName + ">",
                          {head: curPos, anchor: curPos});
      if (doIndent) {
        cm.indentLine(pos.line + 1);
        cm.indentLine(pos.line + 2);
      }
      return;
    } else if (ch == "/" && tok.string == "<") {
      var tagName = state.context && state.context.tagName;
      if (tagName) cm.replaceSelection("/" + tagName + ">", "end");
      return;
    }
    return CodeMirror.Pass;
  }

  function indexOf(collection, elt) {
    if (collection.indexOf) return collection.indexOf(elt);
    for (var i = 0, e = collection.length; i < e; ++i)
      if (collection[i] == elt) return i;
    return -1;
  }
})();
