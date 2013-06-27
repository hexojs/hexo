CodeMirror.indentRangeFinder = function(cm, start) {
  var tabSize = cm.getOption("tabSize"), firstLine = cm.getLine(start.line);
  var myIndent = CodeMirror.countColumn(firstLine, null, tabSize);
  for (var i = start.line + 1, end = cm.lineCount(); i < end; ++i) {
    var curLine = cm.getLine(i);
    if (CodeMirror.countColumn(curLine, null, tabSize) < myIndent &&
        CodeMirror.countColumn(cm.getLine(i-1), null, tabSize) > myIndent)
      return {from: CodeMirror.Pos(start.line, firstLine.length),
              to: CodeMirror.Pos(i, curLine.length)};
  }
};
