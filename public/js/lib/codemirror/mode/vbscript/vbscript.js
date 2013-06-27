CodeMirror.defineMode("vbscript", function() {
  var regexVBScriptKeyword = /^(?:Call|Case|CDate|Clear|CInt|CLng|Const|CStr|Description|Dim|Do|Each|Else|ElseIf|End|Err|Error|Exit|False|For|Function|If|LCase|Loop|LTrim|Next|Nothing|Now|Number|On|Preserve|Quit|ReDim|Resume|RTrim|Select|Set|Sub|Then|To|Trim|True|UBound|UCase|Until|VbCr|VbCrLf|VbLf|VbTab)$/im;

  return {
    token: function(stream) {
      if (stream.eatSpace()) return null;
      var ch = stream.next();
      if (ch == "'") {
        stream.skipToEnd();
        return "comment";
      }
      if (ch == '"') {
        stream.skipTo('"');
        return "string";
      }

      if (/\w/.test(ch)) {
        stream.eatWhile(/\w/);
        if (regexVBScriptKeyword.test(stream.current())) return "keyword";
      }
      return null;
    }
  };
});

CodeMirror.defineMIME("text/vbscript", "vbscript");
