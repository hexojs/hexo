namespace = "comment_";

(function() {
  function test(name, mode, run, before, after) {
    return testCM(name, function(cm) {
      run(cm);
      eq(cm.getValue(), after);
    }, {value: before, mode: mode});
  }

  var simpleProg = "function foo() {\n  return bar;\n}";

  test("block", "javascript", function(cm) {
    cm.blockComment(Pos(0, 3), Pos(3, 0), {blockCommentLead: " *"});
  }, simpleProg + "\n", "/* function foo() {\n *   return bar;\n * }\n */");

  test("blockToggle", "javascript", function(cm) {
    cm.blockComment(Pos(0, 3), Pos(2, 0), {blockCommentLead: " *"});
    cm.uncomment(Pos(0, 3), Pos(2, 0), {blockCommentLead: " *"});
  }, simpleProg, simpleProg);

  test("line", "javascript", function(cm) {
    cm.lineComment(Pos(1, 1), Pos(1, 1));
  }, simpleProg, "function foo() {\n//   return bar;\n}");

  test("lineToggle", "javascript", function(cm) {
    cm.lineComment(Pos(0, 0), Pos(2, 1));
    cm.uncomment(Pos(0, 0), Pos(2, 1));
  }, simpleProg, simpleProg);

  test("fallbackToBlock", "css", function(cm) {
    cm.lineComment(Pos(0, 0), Pos(2, 1));
  }, "html {\n  border: none;\n}", "/* html {\n  border: none;\n} */");

  test("fallbackToLine", "ruby", function(cm) {
    cm.blockComment(Pos(0, 0), Pos(1));
  }, "def blah()\n  return hah\n", "# def blah()\n#   return hah\n");

  test("commentRange", "javascript", function(cm) {
    cm.blockComment(Pos(1, 2), Pos(1, 13), {fullLines: false});
  }, simpleProg, "function foo() {\n  /*return bar;*/\n}");

  test("indented", "javascript", function(cm) {
    cm.lineComment(Pos(1, 0), Pos(2), {indent: true});
  }, simpleProg, "function foo() {\n  // return bar;\n  // }");

  test("singleEmptyLine", "javascript", function(cm) {
    cm.setCursor(1);
    cm.execCommand("toggleComment");
  }, "a;\n\nb;", "a;\n// \nb;");
})();
