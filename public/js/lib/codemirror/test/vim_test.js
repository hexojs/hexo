var code = '' +
' wOrd1 (#%\n' +
' word3] \n' +
'aopop pop 0 1 2 3 4\n' +
' (a) [b] {c} \n' +
'int getchar(void) {\n' +
'  static char buf[BUFSIZ];\n' +
'  static char *bufp = buf;\n' +
'  if (n == 0) {  /* buffer is empty */\n' +
'    n = read(0, buf, sizeof buf);\n' +
'    bufp = buf;\n' +
'  }\n' +
'\n' +
'  return (--n >= 0) ? (unsigned char) *bufp++ : EOF;\n' +
' \n' +
'}\n';

var lines = (function() {
  lineText = code.split('\n');
  var ret = [];
  for (var i = 0; i < lineText.length; i++) {
    ret[i] = {
      line: i,
      length: lineText[i].length,
      lineText: lineText[i],
      textStart: /^\s*/.exec(lineText[i])[0].length
    };
  }
  return ret;
})();
var endOfDocument = makeCursor(lines.length - 1,
    lines[lines.length - 1].length);
var wordLine = lines[0];
var bigWordLine = lines[1];
var charLine = lines[2];
var bracesLine = lines[3];
var seekBraceLine = lines[4];

var word1 = {
  start: { line: wordLine.line, ch: 1 },
  end: { line: wordLine.line, ch: 5 }
};
var word2 = {
  start: { line: wordLine.line, ch: word1.end.ch + 2 },
  end: { line: wordLine.line, ch: word1.end.ch + 4 }
};
var word3 = {
  start: { line: bigWordLine.line, ch: 1 },
  end: { line: bigWordLine.line, ch: 5 }
};
var bigWord1 = word1;
var bigWord2 = word2;
var bigWord3 = {
  start: { line: bigWordLine.line, ch: 1 },
  end: { line: bigWordLine.line, ch: 7 }
};
var bigWord4 = {
  start: { line: bigWordLine.line, ch: bigWord1.end.ch + 3 },
  end: { line: bigWordLine.line, ch: bigWord1.end.ch + 7 }
};

var oChars = [ { line: charLine.line, ch: 1 },
    { line: charLine.line, ch: 3 },
    { line: charLine.line, ch: 7 } ];
var pChars = [ { line: charLine.line, ch: 2 },
    { line: charLine.line, ch: 4 },
    { line: charLine.line, ch: 6 },
    { line: charLine.line, ch: 8 } ];
var numChars = [ { line: charLine.line, ch: 10 },
    { line: charLine.line, ch: 12 },
    { line: charLine.line, ch: 14 },
    { line: charLine.line, ch: 16 },
    { line: charLine.line, ch: 18 }];
var parens1 = {
  start: { line: bracesLine.line, ch: 1 },
  end: { line: bracesLine.line, ch: 3 }
};
var squares1 = {
  start: { line: bracesLine.line, ch: 5 },
  end: { line: bracesLine.line, ch: 7 }
};
var curlys1 = {
  start: { line: bracesLine.line, ch: 9 },
  end: { line: bracesLine.line, ch: 11 }
};
var seekOutside = {
  start: { line: seekBraceLine.line, ch: 1 },
  end: { line: seekBraceLine.line, ch: 16 }
};
var seekInside = {
  start: { line: seekBraceLine.line, ch: 14 },
  end: { line: seekBraceLine.line, ch: 11 }
};

function copyCursor(cur) {
  return { ch: cur.ch, line: cur.line };
}

function testVim(name, run, opts, expectedFail) {
  var vimOpts = {
    lineNumbers: true,
    keyMap: 'vim',
    showCursorWhenSelecting: true,
    value: code
  };
  for (var prop in opts) {
    if (opts.hasOwnProperty(prop)) {
      vimOpts[prop] = opts[prop];
    }
  }
  return test('vim_' + name, function() {
    var place = document.getElementById("testground");
    var cm = CodeMirror(place, vimOpts);
    CodeMirror.Vim.maybeInitState(cm);
    var vim = cm.vimState;

    function doKeysFn(cm) {
      return function(args) {
        if (args instanceof Array) {
          arguments = args;
        }
        for (var i = 0; i < arguments.length; i++) {
          CodeMirror.Vim.handleKey(cm, arguments[i]);
        }
      }
    }
    function doInsertModeKeysFn(cm) {
      return function(args) {
        if (args instanceof Array) { arguments = args; }
        function executeHandler(handler) {
          if (typeof handler == 'string') {
            CodeMirror.commands[handler](cm);
          } else {
            handler(cm);
          }
          return true;
        }
        for (var i = 0; i < arguments.length; i++) {
          var key = arguments[i];
          // Find key in keymap and handle.
          var handled = CodeMirror.lookupKey(key, ['vim-insert'], executeHandler);
          // Record for insert mode.
          if (handled === true && cm.vimState.insertMode && arguments[i] != 'Esc') {
            var lastChange = CodeMirror.Vim.getVimGlobalState_().macroModeState.lastInsertModeChanges;
            if (lastChange) {
              lastChange.changes.push(new CodeMirror.Vim.InsertModeKey(key));
            }
          }
        }
      }
    }
    function doExFn(cm) {
      return function(command) {
        cm.openDialog = helpers.fakeOpenDialog(command);
        helpers.doKeys(':');
      }
    }
    function assertCursorAtFn(cm) {
      return function(line, ch) {
        var pos;
        if (ch == null && typeof line.line == 'number') {
          pos = line;
        } else {
          pos = makeCursor(line, ch);
        }
        eqPos(pos, cm.getCursor());
      }
    }
    function fakeOpenDialog(result) {
      return function(text, callback) {
        return callback(result);
      }
    }
    var helpers = {
      doKeys: doKeysFn(cm),
      // Warning: Only emulates keymap events, not character insertions. Use
      // replaceRange to simulate character insertions.
      // Keys are in CodeMirror format, NOT vim format.
      doInsertModeKeys: doInsertModeKeysFn(cm),
      doEx: doExFn(cm),
      assertCursorAt: assertCursorAtFn(cm),
      fakeOpenDialog: fakeOpenDialog,
      getRegisterController: function() {
        return CodeMirror.Vim.getRegisterController();
      }
    }
    CodeMirror.Vim.clearVimGlobalState_();
    var successful = false;
    try {
      run(cm, vim, helpers);
      successful = true;
    } finally {
      if ((debug && !successful) || verbose) {
        place.style.visibility = "visible";
      } else {
        place.removeChild(cm.getWrapperElement());
      }
    }
  }, expectedFail);
};
testVim('qq@q', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('q', 'q', 'l', 'l', 'q');
  helpers.assertCursorAt(0,2);
  helpers.doKeys('@', 'q');
  helpers.assertCursorAt(0,4);
}, { value: '            '});
testVim('@@', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('q', 'q', 'l', 'l', 'q');
  helpers.assertCursorAt(0,2);
  helpers.doKeys('@', 'q');
  helpers.assertCursorAt(0,4);
  helpers.doKeys('@', '@');
  helpers.assertCursorAt(0,6);
}, { value: '            '});
var jumplistScene = ''+
  'word\n'+
  '(word)\n'+
  '{word\n'+
  'word.\n'+
  '\n'+
  'word search\n'+
  '}word\n'+
  'word\n'+
  'word\n';
function testJumplist(name, keys, endPos, startPos, dialog) {
  endPos = makeCursor(endPos[0], endPos[1]);
  startPos = makeCursor(startPos[0], startPos[1]);
  testVim(name, function(cm, vim, helpers) {
    CodeMirror.Vim.clearVimGlobalState_();
    if(dialog)cm.openDialog = helpers.fakeOpenDialog('word');
    cm.setCursor(startPos);
    helpers.doKeys.apply(null, keys);
    helpers.assertCursorAt(endPos);
  }, {value: jumplistScene});
};
testJumplist('jumplist_H', ['H', '<C-o>'], [5,2], [5,2]);
testJumplist('jumplist_M', ['M', '<C-o>'], [2,2], [2,2]);
testJumplist('jumplist_L', ['L', '<C-o>'], [2,2], [2,2]);
testJumplist('jumplist_[[', ['[', '[', '<C-o>'], [5,2], [5,2]);
testJumplist('jumplist_]]', [']', ']', '<C-o>'], [2,2], [2,2]);
testJumplist('jumplist_G', ['G', '<C-o>'], [5,2], [5,2]);
testJumplist('jumplist_gg', ['g', 'g', '<C-o>'], [5,2], [5,2]);
testJumplist('jumplist_%', ['%', '<C-o>'], [1,5], [1,5]);
testJumplist('jumplist_{', ['{', '<C-o>'], [1,5], [1,5]);
testJumplist('jumplist_}', ['}', '<C-o>'], [1,5], [1,5]);
testJumplist('jumplist_\'', ['m', 'a', 'h', '\'', 'a', 'h', '<C-i>'], [1,5], [1,5]);
testJumplist('jumplist_`', ['m', 'a', 'h', '`', 'a', 'h', '<C-i>'], [1,5], [1,5]);
testJumplist('jumplist_*_cachedCursor', ['*', '<C-o>'], [1,3], [1,3]);
testJumplist('jumplist_#_cachedCursor', ['#', '<C-o>'], [1,3], [1,3]);
testJumplist('jumplist_n', ['#', 'n', '<C-o>'], [1,1], [2,3]);
testJumplist('jumplist_N', ['#', 'N', '<C-o>'], [1,1], [2,3]);
testJumplist('jumplist_repeat_<c-o>', ['*', '*', '*', '3', '<C-o>'], [2,3], [2,3]);
testJumplist('jumplist_repeat_<c-i>', ['*', '*', '*', '3', '<C-o>', '2', '<C-i>'], [5,0], [2,3]);
testJumplist('jumplist_repeated_motion', ['3', '*', '<C-o>'], [2,3], [2,3]);
testJumplist('jumplist_/', ['/', '<C-o>'], [2,3], [2,3], 'dialog');
testJumplist('jumplist_?', ['?', '<C-o>'], [2,3], [2,3], 'dialog');
testJumplist('jumplist_skip_delted_mark<c-o>',
             ['*', 'n', 'n', 'k', 'd', 'k', '<C-o>', '<C-o>', '<C-o>'],
             [0,2], [0,2]);
testJumplist('jumplist_skip_delted_mark<c-i>',
             ['*', 'n', 'n', 'k', 'd', 'k', '<C-o>', '<C-i>', '<C-i>'],
             [1,0], [0,2]);
/**
 * @param name Name of the test
 * @param keys An array of keys or a string with a single key to simulate.
 * @param endPos The expected end position of the cursor.
 * @param startPos The position the cursor should start at, defaults to 0, 0.
 */
function testMotion(name, keys, endPos, startPos) {
  testVim(name, function(cm, vim, helpers) {
    if (!startPos) {
      startPos = { line: 0, ch: 0 };
    }
    cm.setCursor(startPos);
    helpers.doKeys(keys);
    helpers.assertCursorAt(endPos);
  });
};

function makeCursor(line, ch) {
  return { line: line, ch: ch };
};

function offsetCursor(cur, offsetLine, offsetCh) {
  return { line: cur.line + offsetLine, ch: cur.ch + offsetCh };
};

// Motion tests
testMotion('|', '|', makeCursor(0, 0), makeCursor(0,4));
testMotion('|_repeat', ['3', '|'], makeCursor(0, 2), makeCursor(0,4));
testMotion('h', 'h', makeCursor(0, 0), word1.start);
testMotion('h_repeat', ['3', 'h'], offsetCursor(word1.end, 0, -3), word1.end);
testMotion('l', 'l', makeCursor(0, 1));
testMotion('l_repeat', ['2', 'l'], makeCursor(0, 2));
testMotion('j', 'j', offsetCursor(word1.end, 1, 0), word1.end);
testMotion('j_repeat', ['2', 'j'], offsetCursor(word1.end, 2, 0), word1.end);
testMotion('k', 'k', offsetCursor(word3.end, -1, 0), word3.end);
testMotion('k_repeat', ['2', 'k'], makeCursor(0, 4), makeCursor(2, 4));
testMotion('w', 'w', word1.start);
testMotion('w_multiple_newlines_no_space', 'w', makeCursor(12, 2), makeCursor(11, 2));
testMotion('w_multiple_newlines_with_space', 'w', makeCursor(14, 0), makeCursor(12, 51));
testMotion('w_repeat', ['2', 'w'], word2.start);
testMotion('w_wrap', ['w'], word3.start, word2.start);
testMotion('w_endOfDocument', 'w', endOfDocument, endOfDocument);
testMotion('w_start_to_end', ['1000', 'w'], endOfDocument, makeCursor(0, 0));
testMotion('W', 'W', bigWord1.start);
testMotion('W_repeat', ['2', 'W'], bigWord3.start, bigWord1.start);
testMotion('e', 'e', word1.end);
testMotion('e_repeat', ['2', 'e'], word2.end);
testMotion('e_wrap', 'e', word3.end, word2.end);
testMotion('e_endOfDocument', 'e', endOfDocument, endOfDocument);
testMotion('e_start_to_end', ['1000', 'e'], endOfDocument, makeCursor(0, 0));
testMotion('b', 'b', word3.start, word3.end);
testMotion('b_repeat', ['2', 'b'], word2.start, word3.end);
testMotion('b_wrap', 'b', word2.start, word3.start);
testMotion('b_startOfDocument', 'b', makeCursor(0, 0), makeCursor(0, 0));
testMotion('b_end_to_start', ['1000', 'b'], makeCursor(0, 0), endOfDocument);
testMotion('ge', ['g', 'e'], word2.end, word3.end);
testMotion('ge_repeat', ['2', 'g', 'e'], word1.end, word3.start);
testMotion('ge_wrap', ['g', 'e'], word2.end, word3.start);
testMotion('ge_startOfDocument', ['g', 'e'], makeCursor(0, 0),
    makeCursor(0, 0));
testMotion('ge_end_to_start', ['1000', 'g', 'e'], makeCursor(0, 0), endOfDocument);
testMotion('gg', ['g', 'g'], makeCursor(lines[0].line, lines[0].textStart),
    makeCursor(3, 1));
testMotion('gg_repeat', ['3', 'g', 'g'],
    makeCursor(lines[2].line, lines[2].textStart));
testMotion('G', 'G',
    makeCursor(lines[lines.length - 1].line, lines[lines.length - 1].textStart),
    makeCursor(3, 1));
testMotion('G_repeat', ['3', 'G'], makeCursor(lines[2].line,
    lines[2].textStart));
// TODO: Make the test code long enough to test Ctrl-F and Ctrl-B.
testMotion('0', '0', makeCursor(0, 0), makeCursor(0, 8));
testMotion('^', '^', makeCursor(0, lines[0].textStart), makeCursor(0, 8));
testMotion('+', '+', makeCursor(1, lines[1].textStart), makeCursor(0, 8));
testMotion('-', '-', makeCursor(0, lines[0].textStart), makeCursor(1, 4));
testMotion('_', ['6','_'], makeCursor(5, lines[5].textStart), makeCursor(0, 8));
testMotion('$', '$', makeCursor(0, lines[0].length - 1), makeCursor(0, 1));
testMotion('$_repeat', ['2', '$'], makeCursor(1, lines[1].length - 1),
    makeCursor(0, 3));
testMotion('f', ['f', 'p'], pChars[0], makeCursor(charLine.line, 0));
testMotion('f_repeat', ['2', 'f', 'p'], pChars[2], pChars[0]);
testMotion('f_num', ['f', '2'], numChars[2], makeCursor(charLine.line, 0));
testMotion('t', ['t','p'], offsetCursor(pChars[0], 0, -1),
    makeCursor(charLine.line, 0));
testMotion('t_repeat', ['2', 't', 'p'], offsetCursor(pChars[2], 0, -1),
    pChars[0]);
testMotion('F', ['F', 'p'], pChars[0], pChars[1]);
testMotion('F_repeat', ['2', 'F', 'p'], pChars[0], pChars[2]);
testMotion('T', ['T', 'p'], offsetCursor(pChars[0], 0, 1), pChars[1]);
testMotion('T_repeat', ['2', 'T', 'p'], offsetCursor(pChars[0], 0, 1), pChars[2]);
testMotion('%_parens', ['%'], parens1.end, parens1.start);
testMotion('%_squares', ['%'], squares1.end, squares1.start);
testMotion('%_braces', ['%'], curlys1.end, curlys1.start);
testMotion('%_seek_outside', ['%'], seekOutside.end, seekOutside.start);
testMotion('%_seek_inside', ['%'], seekInside.end, seekInside.start);
testVim('%_seek_skip', function(cm, vim, helpers) {
  cm.setCursor(0,0);
  helpers.doKeys(['%']);
  helpers.assertCursorAt(0,9);
}, {value:'01234"("()'});
testVim('%_skip_string', function(cm, vim, helpers) {
  cm.setCursor(0,0);
  helpers.doKeys(['%']);
  helpers.assertCursorAt(0,4);
  cm.setCursor(0,2);
  helpers.doKeys(['%']);
  helpers.assertCursorAt(0,0);
}, {value:'(")")'});
(')')
testVim('%_skip_comment', function(cm, vim, helpers) {
  cm.setCursor(0,0);
  helpers.doKeys(['%']);
  helpers.assertCursorAt(0,6);
  cm.setCursor(0,3);
  helpers.doKeys(['%']);
  helpers.assertCursorAt(0,0);
}, {value:'(/*)*/)'});
// Make sure that moving down after going to the end of a line always leaves you
// at the end of a line, but preserves the offset in other cases
testVim('Changing lines after Eol operation', function(cm, vim, helpers) {
  cm.setCursor(0,0);
  helpers.doKeys(['$']);
  helpers.doKeys(['j']);
  // After moving to Eol and then down, we should be at Eol of line 2
  helpers.assertCursorAt({ line: 1, ch: lines[1].length - 1 });
  helpers.doKeys(['j']);
  // After moving down, we should be at Eol of line 3
  helpers.assertCursorAt({ line: 2, ch: lines[2].length - 1 });
  helpers.doKeys(['h']);
  helpers.doKeys(['j']);
  // After moving back one space and then down, since line 4 is shorter than line 2, we should
  // be at Eol of line 2 - 1
  helpers.assertCursorAt({ line: 3, ch: lines[3].length - 1 });
  helpers.doKeys(['j']);
  helpers.doKeys(['j']);
  // After moving down again, since line 3 has enough characters, we should be back to the
  // same place we were at on line 1
  helpers.assertCursorAt({ line: 5, ch: lines[2].length - 2 });
});
//making sure gj and gk recover from clipping
testVim('gj_gk_clipping', function(cm,vim,helpers){
  cm.setCursor(0, 1);
  helpers.doKeys('g','j','g','j');
  helpers.assertCursorAt(2, 1);
  helpers.doKeys('g','k','g','k');
  helpers.assertCursorAt(0, 1);
},{value: 'line 1\n\nline 2'});
//testing a mix of j/k and gj/gk
testVim('j_k_and_gj_gk', function(cm,vim,helpers){
  cm.setSize(120);
  cm.setCursor(0, 0);
  //go to the last character on the first line
  helpers.doKeys('$');
  //move up/down on the column within the wrapped line
  //side-effect: cursor is not locked to eol anymore
  helpers.doKeys('g','k');
  var cur=cm.getCursor();
  eq(cur.line,0);
  is((cur.ch<176),'gk didn\'t move cursor back (1)');
  helpers.doKeys('g','j');
  helpers.assertCursorAt(0, 176);
  //should move to character 177 on line 2 (j/k preserve character index within line)
  helpers.doKeys('j');
  //due to different line wrapping, the cursor can be on a different screen-x now
  //gj and gk preserve screen-x on movement, much like moveV
  helpers.doKeys('3','g','k');
  cur=cm.getCursor();
  eq(cur.line,1);
  is((cur.ch<176),'gk didn\'t move cursor back (2)');
  helpers.doKeys('g','j','2','g','j');
  //should return to the same character-index
  helpers.doKeys('k');
  helpers.assertCursorAt(0, 176);
},{ lineWrapping:true, value: 'This line is intentially long to test movement of gj and gk over wrapped lines. I will start on the end of this line, then make a step up and back to set the origin for j and k.\nThis line is supposed to be even longer than the previous. I will jump here and make another wiggle with gj and gk, before I jump back to the line above. Both wiggles should not change my cursor\'s target character but both j/k and gj/gk change each other\'s reference position.'});
testVim('gj_gk', function(cm, vim, helpers) {
  if (phantom) return;
  cm.setSize(120);
  // Test top of document edge case.
  cm.setCursor(0, 4);
  helpers.doKeys('g', 'j');
  helpers.doKeys('10', 'g', 'k');
  helpers.assertCursorAt(0, 4);

  // Test moving down preserves column position.
  helpers.doKeys('g', 'j');
  var pos1 = cm.getCursor();
  var expectedPos2 = { line: 0, ch: (pos1.ch - 4) * 2 + 4};
  helpers.doKeys('g', 'j');
  helpers.assertCursorAt(expectedPos2);

  // Move to the last character
  cm.setCursor(0, 0);
  // Move left to reset HSPos
  helpers.doKeys('h');
  // Test bottom of document edge case.
  helpers.doKeys('100', 'g', 'j');
  var endingPos = cm.getCursor();
  is(endingPos != 0, 'gj should not be on wrapped line 0');
  var topLeftCharCoords = cm.charCoords(makeCursor(0, 0));
  var endingCharCoords = cm.charCoords(endingPos);
  is(topLeftCharCoords.left == endingCharCoords.left, 'gj should end up on column 0');
},{ lineNumbers: false, lineWrapping:true, value: 'Thislineisintentiallylongtotestmovementofgjandgkoverwrappedlines.' });
testVim('}', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('}');
  helpers.assertCursorAt(1, 0);
  cm.setCursor(0, 0);
  helpers.doKeys('2', '}');
  helpers.assertCursorAt(4, 0);
  cm.setCursor(0, 0);
  helpers.doKeys('6', '}');
  helpers.assertCursorAt(5, 0);
}, { value: 'a\n\nb\nc\n\nd' });
testVim('{', function(cm, vim, helpers) {
  cm.setCursor(5, 0);
  helpers.doKeys('{');
  helpers.assertCursorAt(4, 0);
  cm.setCursor(5, 0);
  helpers.doKeys('2', '{');
  helpers.assertCursorAt(1, 0);
  cm.setCursor(5, 0);
  helpers.doKeys('6', '{');
  helpers.assertCursorAt(0, 0);
}, { value: 'a\n\nb\nc\n\nd' });

// Operator tests
testVim('dl', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 0);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'l');
  eq('word1 ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq(' ', register.text);
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
}, { value: ' word1 ' });
testVim('dl_eol', function(cm, vim, helpers) {
  // TODO:  This test is incorrect.  The cursor should end up at (0, 5).
  var curStart = makeCursor(0, 6);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'l');
  eq(' word1', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq(' ', register.text);
  is(!register.linewise);
  helpers.assertCursorAt(0, 6);
}, { value: ' word1 ' });
testVim('dl_repeat', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 0);
  cm.setCursor(curStart);
  helpers.doKeys('2', 'd', 'l');
  eq('ord1 ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq(' w', register.text);
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
}, { value: ' word1 ' });
testVim('dh', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 3);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'h');
  eq(' wrd1 ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('o', register.text);
  is(!register.linewise);
  eqPos(offsetCursor(curStart, 0 , -1), cm.getCursor());
}, { value: ' word1 ' });
testVim('dj', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 3);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'j');
  eq(' word3', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq(' word1\nword2\n', register.text);
  is(register.linewise);
  helpers.assertCursorAt(0, 1);
}, { value: ' word1\nword2\n word3' });
testVim('dj_end_of_document', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 3);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'j');
  eq(' word1 ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('', register.text);
  is(!register.linewise);
  helpers.assertCursorAt(0, 3);
}, { value: ' word1 ' });
testVim('dk', function(cm, vim, helpers) {
  var curStart = makeCursor(1, 3);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'k');
  eq(' word3', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq(' word1\nword2\n', register.text);
  is(register.linewise);
  helpers.assertCursorAt(0, 1);
}, { value: ' word1\nword2\n word3' });
testVim('dk_start_of_document', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 3);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'k');
  eq(' word1 ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('', register.text);
  is(!register.linewise);
  helpers.assertCursorAt(0, 3);
}, { value: ' word1 ' });
testVim('dw_space', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 0);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'w');
  eq('word1 ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq(' ', register.text);
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
}, { value: ' word1 ' });
testVim('dw_word', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 1);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'w');
  eq(' word2', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('word1 ', register.text);
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
}, { value: ' word1 word2' });
testVim('dw_only_word', function(cm, vim, helpers) {
  // Test that if there is only 1 word left, dw deletes till the end of the
  // line.
  var curStart = makeCursor(0, 1);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'w');
  eq(' ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('word1 ', register.text);
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
}, { value: ' word1 ' });
testVim('dw_eol', function(cm, vim, helpers) {
  // Assert that dw does not delete the newline if last word to delete is at end
  // of line.
  var curStart = makeCursor(0, 1);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'w');
  eq(' \nword2', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('word1', register.text);
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
}, { value: ' word1\nword2' });
testVim('dw_eol_with_multiple_newlines', function(cm, vim, helpers) {
  // Assert that dw does not delete the newline if last word to delete is at end
  // of line and it is followed by multiple newlines.
  var curStart = makeCursor(0, 1);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'w');
  eq(' \n\nword2', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('word1', register.text);
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
}, { value: ' word1\n\nword2' });
testVim('dw_empty_line_followed_by_whitespace', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('d', 'w');
  eq('  \nword', cm.getValue());
}, { value: '\n  \nword' });
testVim('dw_empty_line_followed_by_word', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('d', 'w');
  eq('word', cm.getValue());
}, { value: '\nword' });
testVim('dw_empty_line_followed_by_empty_line', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('d', 'w');
  eq('\n', cm.getValue());
}, { value: '\n\n' });
testVim('dw_whitespace_followed_by_whitespace', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('d', 'w');
  eq('\n   \n', cm.getValue());
}, { value: '  \n   \n' });
testVim('dw_whitespace_followed_by_empty_line', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('d', 'w');
  eq('\n\n', cm.getValue());
}, { value: '  \n\n' });
testVim('dw_word_whitespace_word', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('d', 'w');
  eq('\n   \nword2', cm.getValue());
}, { value: 'word1\n   \nword2'})
testVim('dw_end_of_document', function(cm, vim, helpers) {
  cm.setCursor(1, 2);
  helpers.doKeys('d', 'w');
  eq('\nab', cm.getValue());
}, { value: '\nabc' });
testVim('dw_repeat', function(cm, vim, helpers) {
  // Assert that dw does delete newline if it should go to the next line, and
  // that repeat works properly.
  var curStart = makeCursor(0, 1);
  cm.setCursor(curStart);
  helpers.doKeys('d', '2', 'w');
  eq(' ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('word1\nword2', register.text);
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
}, { value: ' word1\nword2' });
testVim('de_word_start_and_empty_lines', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('d', 'e');
  eq('\n\n', cm.getValue());
}, { value: 'word\n\n' });
testVim('de_word_end_and_empty_lines', function(cm, vim, helpers) {
  cm.setCursor(0, 3);
  helpers.doKeys('d', 'e');
  eq('wor', cm.getValue());
}, { value: 'word\n\n\n' });
testVim('de_whitespace_and_empty_lines', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('d', 'e');
  eq('', cm.getValue());
}, { value: '   \n\n\n' });
testVim('de_end_of_document', function(cm, vim, helpers) {
  cm.setCursor(1, 2);
  helpers.doKeys('d', 'e');
  eq('\nab', cm.getValue());
}, { value: '\nabc' });
testVim('db_empty_lines', function(cm, vim, helpers) {
  cm.setCursor(2, 0);
  helpers.doKeys('d', 'b');
  eq('\n\n', cm.getValue());
}, { value: '\n\n\n' });
testVim('db_word_start_and_empty_lines', function(cm, vim, helpers) {
  cm.setCursor(2, 0);
  helpers.doKeys('d', 'b');
  eq('\nword', cm.getValue());
}, { value: '\n\nword' });
testVim('db_word_end_and_empty_lines', function(cm, vim, helpers) {
  cm.setCursor(2, 3);
  helpers.doKeys('d', 'b');
  eq('\n\nd', cm.getValue());
}, { value: '\n\nword' });
testVim('db_whitespace_and_empty_lines', function(cm, vim, helpers) {
  cm.setCursor(2, 0);
  helpers.doKeys('d', 'b');
  eq('', cm.getValue());
}, { value: '\n   \n' });
testVim('db_start_of_document', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('d', 'b');
  eq('abc\n', cm.getValue());
}, { value: 'abc\n' });
testVim('dge_empty_lines', function(cm, vim, helpers) {
  cm.setCursor(1, 0);
  helpers.doKeys('d', 'g', 'e');
  // Note: In real VIM the result should be '', but it's not quite consistent,
  // since 2 newlines are deleted. But in the similar case of word\n\n, only
  // 1 newline is deleted. We'll diverge from VIM's behavior since it's much
  // easier this way.
  eq('\n', cm.getValue());
}, { value: '\n\n' });
testVim('dge_word_and_empty_lines', function(cm, vim, helpers) {
  cm.setCursor(1, 0);
  helpers.doKeys('d', 'g', 'e');
  eq('wor\n', cm.getValue());
}, { value: 'word\n\n'});
testVim('dge_whitespace_and_empty_lines', function(cm, vim, helpers) {
  cm.setCursor(2, 0);
  helpers.doKeys('d', 'g', 'e');
  eq('', cm.getValue());
}, { value: '\n  \n' });
testVim('dge_start_of_document', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('d', 'g', 'e');
  eq('bc\n', cm.getValue());
}, { value: 'abc\n' });
testVim('d_inclusive', function(cm, vim, helpers) {
  // Assert that when inclusive is set, the character the cursor is on gets
  // deleted too.
  var curStart = makeCursor(0, 1);
  cm.setCursor(curStart);
  helpers.doKeys('d', 'e');
  eq('  ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('word1', register.text);
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
}, { value: ' word1 ' });
testVim('d_reverse', function(cm, vim, helpers) {
  // Test that deleting in reverse works.
  cm.setCursor(1, 0);
  helpers.doKeys('d', 'b');
  eq(' word2 ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('word1\n', register.text);
  is(!register.linewise);
  helpers.assertCursorAt(0, 1);
}, { value: ' word1\nword2 ' });
testVim('dd', function(cm, vim, helpers) {
  cm.setCursor(0, 3);
  var expectedBuffer = cm.getRange({ line: 0, ch: 0 },
    { line: 1, ch: 0 });
  var expectedLineCount = cm.lineCount() - 1;
  helpers.doKeys('d', 'd');
  eq(expectedLineCount, cm.lineCount());
  var register = helpers.getRegisterController().getRegister();
  eq(expectedBuffer, register.text);
  is(register.linewise);
  helpers.assertCursorAt(0, lines[1].textStart);
});
testVim('dd_prefix_repeat', function(cm, vim, helpers) {
  cm.setCursor(0, 3);
  var expectedBuffer = cm.getRange({ line: 0, ch: 0 },
    { line: 2, ch: 0 });
  var expectedLineCount = cm.lineCount() - 2;
  helpers.doKeys('2', 'd', 'd');
  eq(expectedLineCount, cm.lineCount());
  var register = helpers.getRegisterController().getRegister();
  eq(expectedBuffer, register.text);
  is(register.linewise);
  helpers.assertCursorAt(0, lines[2].textStart);
});
testVim('dd_motion_repeat', function(cm, vim, helpers) {
  cm.setCursor(0, 3);
  var expectedBuffer = cm.getRange({ line: 0, ch: 0 },
    { line: 2, ch: 0 });
  var expectedLineCount = cm.lineCount() - 2;
  helpers.doKeys('d', '2', 'd');
  eq(expectedLineCount, cm.lineCount());
  var register = helpers.getRegisterController().getRegister();
  eq(expectedBuffer, register.text);
  is(register.linewise);
  helpers.assertCursorAt(0, lines[2].textStart);
});
testVim('dd_multiply_repeat', function(cm, vim, helpers) {
  cm.setCursor(0, 3);
  var expectedBuffer = cm.getRange({ line: 0, ch: 0 },
    { line: 6, ch: 0 });
  var expectedLineCount = cm.lineCount() - 6;
  helpers.doKeys('2', 'd', '3', 'd');
  eq(expectedLineCount, cm.lineCount());
  var register = helpers.getRegisterController().getRegister();
  eq(expectedBuffer, register.text);
  is(register.linewise);
  helpers.assertCursorAt(0, lines[6].textStart);
});
testVim('dd_lastline', function(cm, vim, helpers) {
  cm.setCursor(cm.lineCount(), 0);
  var expectedLineCount = cm.lineCount() - 1;
  helpers.doKeys('d', 'd');
  eq(expectedLineCount, cm.lineCount());
  helpers.assertCursorAt(cm.lineCount() - 1, 0);
});
testVim('cw', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('c', '2', 'w');
  eq(' word3', cm.getValue());
  helpers.assertCursorAt(0, 0);
}, { value: 'word1 word2 word3'});
// Yank commands should behave the exact same as d commands, expect that nothing
// gets deleted.
testVim('yw_repeat', function(cm, vim, helpers) {
  // Assert that yw does yank newline if it should go to the next line, and
  // that repeat works properly.
  var curStart = makeCursor(0, 1);
  cm.setCursor(curStart);
  helpers.doKeys('y', '2', 'w');
  eq(' word1\nword2', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('word1\nword2', register.text);
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
}, { value: ' word1\nword2' });
testVim('yy_multiply_repeat', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 3);
  cm.setCursor(curStart);
  var expectedBuffer = cm.getRange({ line: 0, ch: 0 },
    { line: 6, ch: 0 });
  var expectedLineCount = cm.lineCount();
  helpers.doKeys('2', 'y', '3', 'y');
  eq(expectedLineCount, cm.lineCount());
  var register = helpers.getRegisterController().getRegister();
  eq(expectedBuffer, register.text);
  is(register.linewise);
  eqPos(curStart, cm.getCursor());
});
// Change commands behave like d commands except that it also enters insert
// mode. In addition, when the change is linewise, an additional newline is
// inserted so that insert mode starts on that line.
testVim('cw_repeat', function(cm, vim, helpers) {
  // Assert that cw does delete newline if it should go to the next line, and
  // that repeat works properly.
  var curStart = makeCursor(0, 1);
  cm.setCursor(curStart);
  helpers.doKeys('c', '2', 'w');
  eq(' ', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('word1\nword2', register.text);
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
  eq('vim-insert', cm.getOption('keyMap'));
}, { value: ' word1\nword2' });
testVim('cc_multiply_repeat', function(cm, vim, helpers) {
  cm.setCursor(0, 3);
  var expectedBuffer = cm.getRange({ line: 0, ch: 0 },
    { line: 6, ch: 0 });
  var expectedLineCount = cm.lineCount() - 5;
  helpers.doKeys('2', 'c', '3', 'c');
  eq(expectedLineCount, cm.lineCount());
  var register = helpers.getRegisterController().getRegister();
  eq(expectedBuffer, register.text);
  is(register.linewise);
  helpers.assertCursorAt(0, lines[0].textStart);
  eq('vim-insert', cm.getOption('keyMap'));
});
// Swapcase commands edit in place and do not modify registers.
testVim('g~w_repeat', function(cm, vim, helpers) {
  // Assert that dw does delete newline if it should go to the next line, and
  // that repeat works properly.
  var curStart = makeCursor(0, 1);
  cm.setCursor(curStart);
  helpers.doKeys('g', '~', '2', 'w');
  eq(' WORD1\nWORD2', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('', register.text);
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
}, { value: ' word1\nword2' });
testVim('g~g~', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 3);
  cm.setCursor(curStart);
  var expectedLineCount = cm.lineCount();
  var expectedValue = cm.getValue().toUpperCase();
  helpers.doKeys('2', 'g', '~', '3', 'g', '~');
  eq(expectedValue, cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('', register.text);
  is(!register.linewise);
  eqPos(curStart, cm.getCursor());
}, { value: ' word1\nword2\nword3\nword4\nword5\nword6' });
testVim('>{motion}', function(cm, vim, helpers) {
  cm.setCursor(1, 3);
  var expectedLineCount = cm.lineCount();
  var expectedValue = '   word1\n  word2\nword3 ';
  helpers.doKeys('>', 'k');
  eq(expectedValue, cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('', register.text);
  is(!register.linewise);
  helpers.assertCursorAt(0, 3);
}, { value: ' word1\nword2\nword3 ', indentUnit: 2 });
testVim('>>', function(cm, vim, helpers) {
  cm.setCursor(0, 3);
  var expectedLineCount = cm.lineCount();
  var expectedValue = '   word1\n  word2\nword3 ';
  helpers.doKeys('2', '>', '>');
  eq(expectedValue, cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('', register.text);
  is(!register.linewise);
  helpers.assertCursorAt(0, 3);
}, { value: ' word1\nword2\nword3 ', indentUnit: 2 });
testVim('<{motion}', function(cm, vim, helpers) {
  cm.setCursor(1, 3);
  var expectedLineCount = cm.lineCount();
  var expectedValue = ' word1\nword2\nword3 ';
  helpers.doKeys('<', 'k');
  eq(expectedValue, cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('', register.text);
  is(!register.linewise);
  helpers.assertCursorAt(0, 1);
}, { value: '   word1\n  word2\nword3 ', indentUnit: 2 });
testVim('<<', function(cm, vim, helpers) {
  cm.setCursor(0, 3);
  var expectedLineCount = cm.lineCount();
  var expectedValue = ' word1\nword2\nword3 ';
  helpers.doKeys('2', '<', '<');
  eq(expectedValue, cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('', register.text);
  is(!register.linewise);
  helpers.assertCursorAt(0, 1);
}, { value: '   word1\n  word2\nword3 ', indentUnit: 2 });

// Edit tests
function testEdit(name, before, pos, edit, after) {
  return testVim(name, function(cm, vim, helpers) {
             cm.setCursor(0, before.search(pos));
             helpers.doKeys.apply(this, edit.split(''));
             eq(after, cm.getValue());
           }, {value: before});
}

// These Delete tests effectively cover word-wise Change, Visual & Yank.
// Tabs are used as differentiated whitespace to catch edge cases.
// Normal word:
testEdit('diw_mid_spc', 'foo \tbAr\t baz', /A/, 'diw', 'foo \t\t baz');
testEdit('daw_mid_spc', 'foo \tbAr\t baz', /A/, 'daw', 'foo \tbaz');
testEdit('diw_mid_punct', 'foo \tbAr.\t baz', /A/, 'diw', 'foo \t.\t baz');
testEdit('daw_mid_punct', 'foo \tbAr.\t baz', /A/, 'daw', 'foo.\t baz');
testEdit('diw_mid_punct2', 'foo \t,bAr.\t baz', /A/, 'diw', 'foo \t,.\t baz');
testEdit('daw_mid_punct2', 'foo \t,bAr.\t baz', /A/, 'daw', 'foo \t,.\t baz');
testEdit('diw_start_spc', 'bAr \tbaz', /A/, 'diw', ' \tbaz');
testEdit('daw_start_spc', 'bAr \tbaz', /A/, 'daw', 'baz');
testEdit('diw_start_punct', 'bAr. \tbaz', /A/, 'diw', '. \tbaz');
testEdit('daw_start_punct', 'bAr. \tbaz', /A/, 'daw', '. \tbaz');
testEdit('diw_end_spc', 'foo \tbAr', /A/, 'diw', 'foo \t');
testEdit('daw_end_spc', 'foo \tbAr', /A/, 'daw', 'foo');
testEdit('diw_end_punct', 'foo \tbAr.', /A/, 'diw', 'foo \t.');
testEdit('daw_end_punct', 'foo \tbAr.', /A/, 'daw', 'foo.');
// Big word:
testEdit('diW_mid_spc', 'foo \tbAr\t baz', /A/, 'diW', 'foo \t\t baz');
testEdit('daW_mid_spc', 'foo \tbAr\t baz', /A/, 'daW', 'foo \tbaz');
testEdit('diW_mid_punct', 'foo \tbAr.\t baz', /A/, 'diW', 'foo \t\t baz');
testEdit('daW_mid_punct', 'foo \tbAr.\t baz', /A/, 'daW', 'foo \tbaz');
testEdit('diW_mid_punct2', 'foo \t,bAr.\t baz', /A/, 'diW', 'foo \t\t baz');
testEdit('daW_mid_punct2', 'foo \t,bAr.\t baz', /A/, 'daW', 'foo \tbaz');
testEdit('diW_start_spc', 'bAr\t baz', /A/, 'diW', '\t baz');
testEdit('daW_start_spc', 'bAr\t baz', /A/, 'daW', 'baz');
testEdit('diW_start_punct', 'bAr.\t baz', /A/, 'diW', '\t baz');
testEdit('daW_start_punct', 'bAr.\t baz', /A/, 'daW', 'baz');
testEdit('diW_end_spc', 'foo \tbAr', /A/, 'diW', 'foo \t');
testEdit('daW_end_spc', 'foo \tbAr', /A/, 'daW', 'foo');
testEdit('diW_end_punct', 'foo \tbAr.', /A/, 'diW', 'foo \t');
testEdit('daW_end_punct', 'foo \tbAr.', /A/, 'daW', 'foo');

// Operator-motion tests
testVim('D', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 3);
  cm.setCursor(curStart);
  helpers.doKeys('D');
  eq(' wo\nword2\n word3', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('rd1', register.text);
  is(!register.linewise);
  helpers.assertCursorAt(0, 3);
}, { value: ' word1\nword2\n word3' });
testVim('C', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 3);
  cm.setCursor(curStart);
  helpers.doKeys('C');
  eq(' wo\nword2\n word3', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('rd1', register.text);
  is(!register.linewise);
  helpers.assertCursorAt(0, 3);
  eq('vim-insert', cm.getOption('keyMap'));
}, { value: ' word1\nword2\n word3' });
testVim('Y', function(cm, vim, helpers) {
  var curStart = makeCursor(0, 3);
  cm.setCursor(curStart);
  helpers.doKeys('Y');
  eq(' word1\nword2\n word3', cm.getValue());
  var register = helpers.getRegisterController().getRegister();
  eq('rd1', register.text);
  is(!register.linewise);
  helpers.assertCursorAt(0, 3);
}, { value: ' word1\nword2\n word3' });

// Action tests
testVim('ctrl-a', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('<C-a>');
  eq('-9', cm.getValue());
  helpers.assertCursorAt(0, 1);
  helpers.doKeys('2','<C-a>');
  eq('-7', cm.getValue());
}, {value: '-10'});
testVim('ctrl-x', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('<C-x>');
  eq('-1', cm.getValue());
  helpers.assertCursorAt(0, 1);
  helpers.doKeys('2','<C-x>');
  eq('-3', cm.getValue());
}, {value: '0'});
testVim('<C-x>/<C-a> search forward', function(cm, vim, helpers) {
  ['<C-x>', '<C-a>'].forEach(function(key) {
    cm.setCursor(0, 0);
    helpers.doKeys(key);
    helpers.assertCursorAt(0, 5);
    helpers.doKeys('l');
    helpers.doKeys(key);
    helpers.assertCursorAt(0, 10);
    cm.setCursor(0, 11);
    helpers.doKeys(key);
    helpers.assertCursorAt(0, 11);
  });
}, {value: '__jmp1 jmp2 jmp'});
testVim('a', function(cm, vim, helpers) {
  cm.setCursor(0, 1);
  helpers.doKeys('a');
  helpers.assertCursorAt(0, 2);
  eq('vim-insert', cm.getOption('keyMap'));
});
testVim('a_eol', function(cm, vim, helpers) {
  cm.setCursor(0, lines[0].length - 1);
  helpers.doKeys('a');
  helpers.assertCursorAt(0, lines[0].length);
  eq('vim-insert', cm.getOption('keyMap'));
});
testVim('i', function(cm, vim, helpers) {
  cm.setCursor(0, 1);
  helpers.doKeys('i');
  helpers.assertCursorAt(0, 1);
  eq('vim-insert', cm.getOption('keyMap'));
});
testVim('i_repeat', function(cm, vim, helpers) {
  helpers.doKeys('3', 'i');
  cm.replaceRange('test', cm.getCursor());
  helpers.doInsertModeKeys('Esc');
  eq('testtesttest', cm.getValue());
  helpers.assertCursorAt(0, 11);
}, { value: '' });
testVim('i_repeat_delete', function(cm, vim, helpers) {
  cm.setCursor(0, 4);
  helpers.doKeys('2', 'i');
  cm.replaceRange('z', cm.getCursor());
  helpers.doInsertModeKeys('Backspace', 'Backspace', 'Esc');
  eq('abe', cm.getValue());
  helpers.assertCursorAt(0, 1);
}, { value: 'abcde' });
testVim('A', function(cm, vim, helpers) {
  helpers.doKeys('A');
  helpers.assertCursorAt(0, lines[0].length);
  eq('vim-insert', cm.getOption('keyMap'));
});
testVim('I', function(cm, vim, helpers) {
  cm.setCursor(0, 4);
  helpers.doKeys('I');
  helpers.assertCursorAt(0, lines[0].textStart);
  eq('vim-insert', cm.getOption('keyMap'));
});
testVim('I_repeat', function(cm, vim, helpers) {
  cm.setCursor(0, 1);
  helpers.doKeys('3', 'I');
  cm.replaceRange('test', cm.getCursor());
  helpers.doInsertModeKeys('Esc');
  eq('testtesttestblah', cm.getValue());
  helpers.assertCursorAt(0, 11);
}, { value: 'blah' });
testVim('o', function(cm, vim, helpers) {
  cm.setCursor(0, 4);
  helpers.doKeys('o');
  eq('word1\n\nword2', cm.getValue());
  helpers.assertCursorAt(1, 0);
  eq('vim-insert', cm.getOption('keyMap'));
}, { value: 'word1\nword2' });
testVim('o_repeat', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('3', 'o');
  cm.replaceRange('test', cm.getCursor());
  helpers.doInsertModeKeys('Esc');
  eq('\ntest\ntest\ntest', cm.getValue());
  helpers.assertCursorAt(3, 3);
}, { value: '' });
testVim('O', function(cm, vim, helpers) {
  cm.setCursor(0, 4);
  helpers.doKeys('O');
  eq('\nword1\nword2', cm.getValue());
  helpers.assertCursorAt(0, 0);
  eq('vim-insert', cm.getOption('keyMap'));
}, { value: 'word1\nword2' });
testVim('J', function(cm, vim, helpers) {
  cm.setCursor(0, 4);
  helpers.doKeys('J');
  var expectedValue = 'word1  word2\nword3\n word4';
  eq(expectedValue, cm.getValue());
  helpers.assertCursorAt(0, expectedValue.indexOf('word2') - 1);
}, { value: 'word1 \n    word2\nword3\n word4' });
testVim('J_repeat', function(cm, vim, helpers) {
  cm.setCursor(0, 4);
  helpers.doKeys('3', 'J');
  var expectedValue = 'word1  word2 word3\n word4';
  eq(expectedValue, cm.getValue());
  helpers.assertCursorAt(0, expectedValue.indexOf('word3') - 1);
}, { value: 'word1 \n    word2\nword3\n word4' });
testVim('p', function(cm, vim, helpers) {
  cm.setCursor(0, 1);
  helpers.getRegisterController().pushText('"', 'yank', 'abc\ndef', false);
  helpers.doKeys('p');
  eq('__abc\ndef_', cm.getValue());
  helpers.assertCursorAt(1, 2);
}, { value: '___' });
testVim('p_register', function(cm, vim, helpers) {
  cm.setCursor(0, 1);
  helpers.getRegisterController().getRegister('a').set('abc\ndef', false);
  helpers.doKeys('"', 'a', 'p');
  eq('__abc\ndef_', cm.getValue());
  helpers.assertCursorAt(1, 2);
}, { value: '___' });
testVim('p_wrong_register', function(cm, vim, helpers) {
  cm.setCursor(0, 1);
  helpers.getRegisterController().getRegister('a').set('abc\ndef', false);
  helpers.doKeys('p');
  eq('___', cm.getValue());
  helpers.assertCursorAt(0, 1);
}, { value: '___' });
testVim('p_line', function(cm, vim, helpers) {
  cm.setCursor(0, 1);
  helpers.getRegisterController().pushText('"', 'yank', '  a\nd\n', true);
  helpers.doKeys('2', 'p');
  eq('___\n  a\nd\n  a\nd', cm.getValue());
  helpers.assertCursorAt(1, 2);
}, { value: '___' });
testVim('P', function(cm, vim, helpers) {
  cm.setCursor(0, 1);
  helpers.getRegisterController().pushText('"', 'yank', 'abc\ndef', false);
  helpers.doKeys('P');
  eq('_abc\ndef__', cm.getValue());
  helpers.assertCursorAt(1, 3);
}, { value: '___' });
testVim('P_line', function(cm, vim, helpers) {
  cm.setCursor(0, 1);
  helpers.getRegisterController().pushText('"', 'yank', '  a\nd\n', true);
  helpers.doKeys('2', 'P');
  eq('  a\nd\n  a\nd\n___', cm.getValue());
  helpers.assertCursorAt(0, 2);
}, { value: '___' });
testVim('r', function(cm, vim, helpers) {
  cm.setCursor(0, 1);
  helpers.doKeys('3', 'r', 'u');
  eq('wuuuet\nanother', cm.getValue(),'3r failed');
  helpers.assertCursorAt(0, 3);
  cm.setCursor(0, 4);
  helpers.doKeys('v', 'j', 'h', 'r', '<Space>');
  eq('wuuu  \n    her', cm.getValue(),'Replacing selection by space-characters failed');
}, { value: 'wordet\nanother' });
testVim('R', function(cm, vim, helpers) {
  cm.setCursor(0, 1);
  helpers.doKeys('R');
  helpers.assertCursorAt(0, 1);
  eq('vim-replace', cm.getOption('keyMap'));
  is(cm.state.overwrite, 'Setting overwrite state failed');
});
testVim('mark', function(cm, vim, helpers) {
  cm.setCursor(2, 2);
  helpers.doKeys('m', 't');
  cm.setCursor(0, 0);
  helpers.doKeys('\'', 't');
  helpers.assertCursorAt(2, 2);
  cm.setCursor(0, 0);
  helpers.doKeys('`', 't');
  helpers.assertCursorAt(2, 2);
});
testVim('jumpToMark_next', function(cm, vim, helpers) {
  cm.setCursor(2, 2);
  helpers.doKeys('m', 't');
  cm.setCursor(0, 0);
  helpers.doKeys(']', '`');
  helpers.assertCursorAt(2, 2);
  cm.setCursor(0, 0);
  helpers.doKeys(']', '\'');
  helpers.assertCursorAt(2, 0);
});
testVim('jumpToMark_next_repeat', function(cm, vim, helpers) {
  cm.setCursor(2, 2);
  helpers.doKeys('m', 'a');
  cm.setCursor(3, 2);
  helpers.doKeys('m', 'b');
  cm.setCursor(4, 2);
  helpers.doKeys('m', 'c');
  cm.setCursor(0, 0);
  helpers.doKeys('2', ']', '`');
  helpers.assertCursorAt(3, 2);
  cm.setCursor(0, 0);
  helpers.doKeys('2', ']', '\'');
  helpers.assertCursorAt(3, 1);
});
testVim('jumpToMark_next_sameline', function(cm, vim, helpers) {
  cm.setCursor(2, 0);
  helpers.doKeys('m', 'a');
  cm.setCursor(2, 4);
  helpers.doKeys('m', 'b');
  cm.setCursor(2, 2);
  helpers.doKeys(']', '`');
  helpers.assertCursorAt(2, 4);
});
testVim('jumpToMark_next_onlyprev', function(cm, vim, helpers) {
  cm.setCursor(2, 0);
  helpers.doKeys('m', 'a');
  cm.setCursor(4, 0);
  helpers.doKeys(']', '`');
  helpers.assertCursorAt(4, 0);
});
testVim('jumpToMark_next_nomark', function(cm, vim, helpers) {
  cm.setCursor(2, 2);
  helpers.doKeys(']', '`');
  helpers.assertCursorAt(2, 2);
  helpers.doKeys(']', '\'');
  helpers.assertCursorAt(2, 0);
});
testVim('jumpToMark_next_linewise_over', function(cm, vim, helpers) {
  cm.setCursor(2, 2);
  helpers.doKeys('m', 'a');
  cm.setCursor(3, 4);
  helpers.doKeys('m', 'b');
  cm.setCursor(2, 1);
  helpers.doKeys(']', '\'');
  helpers.assertCursorAt(3, 1);
});
testVim('jumpToMark_next_action', function(cm, vim, helpers) {
  cm.setCursor(2, 2);
  helpers.doKeys('m', 't');
  cm.setCursor(0, 0);
  helpers.doKeys('d', ']', '`');
  helpers.assertCursorAt(0, 0);
  var actual = cm.getLine(0);
  var expected = 'pop pop 0 1 2 3 4';
  eq(actual, expected, "Deleting while jumping to the next mark failed.");
});
testVim('jumpToMark_next_line_action', function(cm, vim, helpers) {
  cm.setCursor(2, 2);
  helpers.doKeys('m', 't');
  cm.setCursor(0, 0);
  helpers.doKeys('d', ']', '\'');
  helpers.assertCursorAt(0, 1);
  var actual = cm.getLine(0);
  var expected = ' (a) [b] {c} '
  eq(actual, expected, "Deleting while jumping to the next mark line failed.");
});
testVim('jumpToMark_prev', function(cm, vim, helpers) {
  cm.setCursor(2, 2);
  helpers.doKeys('m', 't');
  cm.setCursor(4, 0);
  helpers.doKeys('[', '`');
  helpers.assertCursorAt(2, 2);
  cm.setCursor(4, 0);
  helpers.doKeys('[', '\'');
  helpers.assertCursorAt(2, 0);
});
testVim('jumpToMark_prev_repeat', function(cm, vim, helpers) {
  cm.setCursor(2, 2);
  helpers.doKeys('m', 'a');
  cm.setCursor(3, 2);
  helpers.doKeys('m', 'b');
  cm.setCursor(4, 2);
  helpers.doKeys('m', 'c');
  cm.setCursor(5, 0);
  helpers.doKeys('2', '[', '`');
  helpers.assertCursorAt(3, 2);
  cm.setCursor(5, 0);
  helpers.doKeys('2', '[', '\'');
  helpers.assertCursorAt(3, 1);
});
testVim('jumpToMark_prev_sameline', function(cm, vim, helpers) {
  cm.setCursor(2, 0);
  helpers.doKeys('m', 'a');
  cm.setCursor(2, 4);
  helpers.doKeys('m', 'b');
  cm.setCursor(2, 2);
  helpers.doKeys('[', '`');
  helpers.assertCursorAt(2, 0);
});
testVim('jumpToMark_prev_onlynext', function(cm, vim, helpers) {
  cm.setCursor(4, 4);
  helpers.doKeys('m', 'a');
  cm.setCursor(2, 0);
  helpers.doKeys('[', '`');
  helpers.assertCursorAt(2, 0);
});
testVim('jumpToMark_prev_nomark', function(cm, vim, helpers) {
  cm.setCursor(2, 2);
  helpers.doKeys('[', '`');
  helpers.assertCursorAt(2, 2);
  helpers.doKeys('[', '\'');
  helpers.assertCursorAt(2, 0);
});
testVim('jumpToMark_prev_linewise_over', function(cm, vim, helpers) {
  cm.setCursor(2, 2);
  helpers.doKeys('m', 'a');
  cm.setCursor(3, 4);
  helpers.doKeys('m', 'b');
  cm.setCursor(3, 6);
  helpers.doKeys('[', '\'');
  helpers.assertCursorAt(2, 0);
});
testVim('delmark_single', function(cm, vim, helpers) {
  cm.setCursor(1, 2);
  helpers.doKeys('m', 't');
  helpers.doEx('delmarks t');
  cm.setCursor(0, 0);
  helpers.doKeys('`', 't');
  helpers.assertCursorAt(0, 0);
});
testVim('delmark_range', function(cm, vim, helpers) {
  cm.setCursor(1, 2);
  helpers.doKeys('m', 'a');
  cm.setCursor(2, 2);
  helpers.doKeys('m', 'b');
  cm.setCursor(3, 2);
  helpers.doKeys('m', 'c');
  cm.setCursor(4, 2);
  helpers.doKeys('m', 'd');
  cm.setCursor(5, 2);
  helpers.doKeys('m', 'e');
  helpers.doEx('delmarks b-d');
  cm.setCursor(0, 0);
  helpers.doKeys('`', 'a');
  helpers.assertCursorAt(1, 2);
  helpers.doKeys('`', 'b');
  helpers.assertCursorAt(1, 2);
  helpers.doKeys('`', 'c');
  helpers.assertCursorAt(1, 2);
  helpers.doKeys('`', 'd');
  helpers.assertCursorAt(1, 2);
  helpers.doKeys('`', 'e');
  helpers.assertCursorAt(5, 2);
});
testVim('delmark_multi', function(cm, vim, helpers) {
  cm.setCursor(1, 2);
  helpers.doKeys('m', 'a');
  cm.setCursor(2, 2);
  helpers.doKeys('m', 'b');
  cm.setCursor(3, 2);
  helpers.doKeys('m', 'c');
  cm.setCursor(4, 2);
  helpers.doKeys('m', 'd');
  cm.setCursor(5, 2);
  helpers.doKeys('m', 'e');
  helpers.doEx('delmarks bcd');
  cm.setCursor(0, 0);
  helpers.doKeys('`', 'a');
  helpers.assertCursorAt(1, 2);
  helpers.doKeys('`', 'b');
  helpers.assertCursorAt(1, 2);
  helpers.doKeys('`', 'c');
  helpers.assertCursorAt(1, 2);
  helpers.doKeys('`', 'd');
  helpers.assertCursorAt(1, 2);
  helpers.doKeys('`', 'e');
  helpers.assertCursorAt(5, 2);
});
testVim('delmark_multi_space', function(cm, vim, helpers) {
  cm.setCursor(1, 2);
  helpers.doKeys('m', 'a');
  cm.setCursor(2, 2);
  helpers.doKeys('m', 'b');
  cm.setCursor(3, 2);
  helpers.doKeys('m', 'c');
  cm.setCursor(4, 2);
  helpers.doKeys('m', 'd');
  cm.setCursor(5, 2);
  helpers.doKeys('m', 'e');
  helpers.doEx('delmarks b c d');
  cm.setCursor(0, 0);
  helpers.doKeys('`', 'a');
  helpers.assertCursorAt(1, 2);
  helpers.doKeys('`', 'b');
  helpers.assertCursorAt(1, 2);
  helpers.doKeys('`', 'c');
  helpers.assertCursorAt(1, 2);
  helpers.doKeys('`', 'd');
  helpers.assertCursorAt(1, 2);
  helpers.doKeys('`', 'e');
  helpers.assertCursorAt(5, 2);
});
testVim('delmark_all', function(cm, vim, helpers) {
  cm.setCursor(1, 2);
  helpers.doKeys('m', 'a');
  cm.setCursor(2, 2);
  helpers.doKeys('m', 'b');
  cm.setCursor(3, 2);
  helpers.doKeys('m', 'c');
  cm.setCursor(4, 2);
  helpers.doKeys('m', 'd');
  cm.setCursor(5, 2);
  helpers.doKeys('m', 'e');
  helpers.doEx('delmarks a b-de');
  cm.setCursor(0, 0);
  helpers.doKeys('`', 'a');
  helpers.assertCursorAt(0, 0);
  helpers.doKeys('`', 'b');
  helpers.assertCursorAt(0, 0);
  helpers.doKeys('`', 'c');
  helpers.assertCursorAt(0, 0);
  helpers.doKeys('`', 'd');
  helpers.assertCursorAt(0, 0);
  helpers.doKeys('`', 'e');
  helpers.assertCursorAt(0, 0);
});
testVim('visual', function(cm, vim, helpers) {
  helpers.doKeys('l', 'v', 'l', 'l');
  helpers.assertCursorAt(0, 3);
  eqPos(makeCursor(0, 1), cm.getCursor('anchor'));
  helpers.doKeys('d');
  eq('15', cm.getValue());
}, { value: '12345' });
testVim('visual_line', function(cm, vim, helpers) {
  helpers.doKeys('l', 'V', 'l', 'j', 'j', 'd');
  eq(' 4\n 5', cm.getValue());
}, { value: ' 1\n 2\n 3\n 4\n 5' });
testVim('visual_marks', function(cm, vim, helpers) {
  helpers.doKeys('l', 'v', 'l', 'l', 'v');
  // Test visual mode marks
  cm.setCursor(0, 0);
  helpers.doKeys('\'', '<');
  helpers.assertCursorAt(0, 1);
  helpers.doKeys('\'', '>');
  helpers.assertCursorAt(0, 3);
});
testVim('visual_join', function(cm, vim, helpers) {
  helpers.doKeys('l', 'V', 'l', 'j', 'j', 'J');
  eq(' 1 2 3\n 4\n 5', cm.getValue());
}, { value: ' 1\n 2\n 3\n 4\n 5' });
testVim('/ and n/N', function(cm, vim, helpers) {
  cm.openDialog = helpers.fakeOpenDialog('match');
  helpers.doKeys('/');
  helpers.assertCursorAt(0, 11);
  helpers.doKeys('n');
  helpers.assertCursorAt(1, 6);
  helpers.doKeys('N');
  helpers.assertCursorAt(0, 11);

  cm.setCursor(0, 0);
  helpers.doKeys('2', '/');
  helpers.assertCursorAt(1, 6);
}, { value: 'match nope match \n nope Match' });
testVim('/_case', function(cm, vim, helpers) {
  cm.openDialog = helpers.fakeOpenDialog('Match');
  helpers.doKeys('/');
  helpers.assertCursorAt(1, 6);
}, { value: 'match nope match \n nope Match' });
testVim('/_nongreedy', function(cm, vim, helpers) {
  cm.openDialog = helpers.fakeOpenDialog('aa');
  helpers.doKeys('/');
  helpers.assertCursorAt(0, 4);
  helpers.doKeys('n');
  helpers.assertCursorAt(1, 3);
  helpers.doKeys('n');
  helpers.assertCursorAt(0, 0);
}, { value: 'aaa aa \n a aa'});
testVim('?_nongreedy', function(cm, vim, helpers) {
  cm.openDialog = helpers.fakeOpenDialog('aa');
  helpers.doKeys('?');
  helpers.assertCursorAt(1, 3);
  helpers.doKeys('n');
  helpers.assertCursorAt(0, 4);
  helpers.doKeys('n');
  helpers.assertCursorAt(0, 0);
}, { value: 'aaa aa \n a aa'});
testVim('/_greedy', function(cm, vim, helpers) {
  cm.openDialog = helpers.fakeOpenDialog('a+');
  helpers.doKeys('/');
  helpers.assertCursorAt(0, 4);
  helpers.doKeys('n');
  helpers.assertCursorAt(1, 1);
  helpers.doKeys('n');
  helpers.assertCursorAt(1, 3);
  helpers.doKeys('n');
  helpers.assertCursorAt(0, 0);
}, { value: 'aaa aa \n a aa'});
testVim('?_greedy', function(cm, vim, helpers) {
  cm.openDialog = helpers.fakeOpenDialog('a+');
  helpers.doKeys('?');
  helpers.assertCursorAt(1, 3);
  helpers.doKeys('n');
  helpers.assertCursorAt(1, 1);
  helpers.doKeys('n');
  helpers.assertCursorAt(0, 4);
  helpers.doKeys('n');
  helpers.assertCursorAt(0, 0);
}, { value: 'aaa aa \n a aa'});
testVim('/_greedy_0_or_more', function(cm, vim, helpers) {
  cm.openDialog = helpers.fakeOpenDialog('a*');
  helpers.doKeys('/');
  helpers.assertCursorAt(0, 3);
  helpers.doKeys('n');
  helpers.assertCursorAt(0, 4);
  helpers.doKeys('n');
  helpers.assertCursorAt(0, 5);
  helpers.doKeys('n');
  helpers.assertCursorAt(1, 0);
  helpers.doKeys('n');
  helpers.assertCursorAt(1, 1);
  helpers.doKeys('n');
  helpers.assertCursorAt(0, 0);
}, { value: 'aaa  aa\n aa'});
testVim('?_greedy_0_or_more', function(cm, vim, helpers) {
  cm.openDialog = helpers.fakeOpenDialog('a*');
  helpers.doKeys('?');
  helpers.assertCursorAt(1, 1);
  helpers.doKeys('n');
  helpers.assertCursorAt(1, 0);
  helpers.doKeys('n');
  helpers.assertCursorAt(0, 5);
  helpers.doKeys('n');
  helpers.assertCursorAt(0, 4);
  helpers.doKeys('n');
  helpers.assertCursorAt(0, 3);
  helpers.doKeys('n');
  helpers.assertCursorAt(0, 0);
}, { value: 'aaa  aa\n aa'});
testVim('? and n/N', function(cm, vim, helpers) {
  cm.openDialog = helpers.fakeOpenDialog('match');
  helpers.doKeys('?');
  helpers.assertCursorAt(1, 6);
  helpers.doKeys('n');
  helpers.assertCursorAt(0, 11);
  helpers.doKeys('N');
  helpers.assertCursorAt(1, 6);

  cm.setCursor(0, 0);
  helpers.doKeys('2', '?');
  helpers.assertCursorAt(0, 11);
}, { value: 'match nope match \n nope Match' });
testVim('*', function(cm, vim, helpers) {
  cm.setCursor(0, 9);
  helpers.doKeys('*');
  helpers.assertCursorAt(0, 22);

  cm.setCursor(0, 9);
  helpers.doKeys('2', '*');
  helpers.assertCursorAt(1, 8);
}, { value: 'nomatch match nomatch match \nnomatch Match' });
testVim('*_no_word', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('*');
  helpers.assertCursorAt(0, 0);
}, { value: ' \n match \n' });
testVim('*_symbol', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('*');
  helpers.assertCursorAt(1, 0);
}, { value: ' /}\n/} match \n' });
testVim('#', function(cm, vim, helpers) {
  cm.setCursor(0, 9);
  helpers.doKeys('#');
  helpers.assertCursorAt(1, 8);

  cm.setCursor(0, 9);
  helpers.doKeys('2', '#');
  helpers.assertCursorAt(0, 22);
}, { value: 'nomatch match nomatch match \nnomatch Match' });
testVim('*_seek', function(cm, vim, helpers) {
  // Should skip over space and symbols.
  cm.setCursor(0, 3);
  helpers.doKeys('*');
  helpers.assertCursorAt(0, 22);
}, { value: '    :=  match nomatch match \nnomatch Match' });
testVim('#', function(cm, vim, helpers) {
  // Should skip over space and symbols.
  cm.setCursor(0, 3);
  helpers.doKeys('#');
  helpers.assertCursorAt(1, 8);
}, { value: '    :=  match nomatch match \nnomatch Match' });
testVim('.', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('2', 'd', 'w');
  helpers.doKeys('.');
  eq('5 6', cm.getValue());
}, { value: '1 2 3 4 5 6'});
testVim('._repeat', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('2', 'd', 'w');
  helpers.doKeys('3', '.');
  eq('6', cm.getValue());
}, { value: '1 2 3 4 5 6'});
testVim('._insert', function(cm, vim, helpers) {
  helpers.doKeys('i');
  cm.replaceRange('test', cm.getCursor());
  helpers.doInsertModeKeys('Esc');
  helpers.doKeys('.');
  eq('testestt', cm.getValue());
  helpers.assertCursorAt(0, 6);
}, { value: ''});
testVim('._insert_repeat', function(cm, vim, helpers) {
  helpers.doKeys('i');
  cm.replaceRange('test', cm.getCursor());
  cm.setCursor(0, 4);
  helpers.doInsertModeKeys('Esc');
  helpers.doKeys('2', '.');
  eq('testesttestt', cm.getValue());
  helpers.assertCursorAt(0, 10);
}, { value: ''});
testVim('._repeat_insert', function(cm, vim, helpers) {
  helpers.doKeys('3', 'i');
  cm.replaceRange('te', cm.getCursor());
  cm.setCursor(0, 2);
  helpers.doInsertModeKeys('Esc');
  helpers.doKeys('.');
  eq('tetettetetee', cm.getValue());
  helpers.assertCursorAt(0, 10);
}, { value: ''});
testVim('._insert_o', function(cm, vim, helpers) {
  helpers.doKeys('o');
  cm.replaceRange('z', cm.getCursor());
  cm.setCursor(1, 1);
  helpers.doInsertModeKeys('Esc');
  helpers.doKeys('.');
  eq('\nz\nz', cm.getValue());
  helpers.assertCursorAt(2, 0);
}, { value: ''});
testVim('._insert_o_repeat', function(cm, vim, helpers) {
  helpers.doKeys('o');
  cm.replaceRange('z', cm.getCursor());
  helpers.doInsertModeKeys('Esc');
  cm.setCursor(1, 0);
  helpers.doKeys('2', '.');
  eq('\nz\nz\nz', cm.getValue());
  helpers.assertCursorAt(3, 0);
}, { value: ''});
testVim('._insert_o_indent', function(cm, vim, helpers) {
  helpers.doKeys('o');
  cm.replaceRange('z', cm.getCursor());
  helpers.doInsertModeKeys('Esc');
  cm.setCursor(1, 2);
  helpers.doKeys('.');
  eq('{\n  z\n  z', cm.getValue());
  helpers.assertCursorAt(2, 2);
}, { value: '{'});
testVim('._insert_cw', function(cm, vim, helpers) {
  helpers.doKeys('c', 'w');
  cm.replaceRange('test', cm.getCursor());
  helpers.doInsertModeKeys('Esc');
  cm.setCursor(0, 3);
  helpers.doKeys('2', 'l');
  helpers.doKeys('.');
  eq('test test word3', cm.getValue());
  helpers.assertCursorAt(0, 8);
}, { value: 'word1 word2 word3' });
testVim('._insert_cw_repeat', function(cm, vim, helpers) {
  // For some reason, repeat cw in desktop VIM will does not repeat insert mode
  // changes. Will conform to that behavior.
  helpers.doKeys('c', 'w');
  cm.replaceRange('test', cm.getCursor());
  helpers.doInsertModeKeys('Esc');
  cm.setCursor(0, 4);
  helpers.doKeys('l');
  helpers.doKeys('2', '.');
  eq('test test', cm.getValue());
  helpers.assertCursorAt(0, 8);
}, { value: 'word1 word2 word3' });
testVim('._delete', function(cm, vim, helpers) {
  cm.setCursor(0, 5);
  helpers.doKeys('i');
  helpers.doInsertModeKeys('Backspace', 'Esc');
  helpers.doKeys('.');
  eq('zace', cm.getValue());
  helpers.assertCursorAt(0, 1);
}, { value: 'zabcde'});
testVim('._delete_repeat', function(cm, vim, helpers) {
  cm.setCursor(0, 6);
  helpers.doKeys('i');
  helpers.doInsertModeKeys('Backspace', 'Esc');
  helpers.doKeys('2', '.');
  eq('zzce', cm.getValue());
  helpers.assertCursorAt(0, 1);
}, { value: 'zzabcde'});
testVim('f;', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('f', 'x');
  helpers.doKeys(';');
  helpers.doKeys('2', ';');
  eq(9, cm.getCursor().ch);
}, { value: '01x3xx678x'});
testVim('F;', function(cm, vim, helpers) {
  cm.setCursor(0, 8);
  helpers.doKeys('F', 'x');
  helpers.doKeys(';');
  helpers.doKeys('2', ';');
  eq(2, cm.getCursor().ch);
}, { value: '01x3xx6x8x'});
testVim('t;', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('t', 'x');
  helpers.doKeys(';');
  helpers.doKeys('2', ';');
  eq(8, cm.getCursor().ch);
}, { value: '01x3xx678x'});
testVim('T;', function(cm, vim, helpers) {
  cm.setCursor(0, 9);
  helpers.doKeys('T', 'x');
  helpers.doKeys(';');
  helpers.doKeys('2', ';');
  eq(2, cm.getCursor().ch);
}, { value: '0xx3xx678x'});
testVim('f,', function(cm, vim, helpers) {
  cm.setCursor(0, 6);
  helpers.doKeys('f', 'x');
  helpers.doKeys(',');
  helpers.doKeys('2', ',');
  eq(2, cm.getCursor().ch);
}, { value: '01x3xx678x'});
testVim('F,', function(cm, vim, helpers) {
  cm.setCursor(0, 3);
  helpers.doKeys('F', 'x');
  helpers.doKeys(',');
  helpers.doKeys('2', ',');
  eq(9, cm.getCursor().ch);
}, { value: '01x3xx678x'});
testVim('t,', function(cm, vim, helpers) {
  cm.setCursor(0, 6);
  helpers.doKeys('t', 'x');
  helpers.doKeys(',');
  helpers.doKeys('2', ',');
  eq(3, cm.getCursor().ch);
}, { value: '01x3xx678x'});
testVim('T,', function(cm, vim, helpers) {
  cm.setCursor(0, 4);
  helpers.doKeys('T', 'x');
  helpers.doKeys(',');
  helpers.doKeys('2', ',');
  eq(8, cm.getCursor().ch);
}, { value: '01x3xx67xx'});
testVim('fd,;', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('f', '4');
  cm.setCursor(0, 0);
  helpers.doKeys('d', ';');
  eq('56789', cm.getValue());
  helpers.doKeys('u');
  cm.setCursor(0, 9);
  helpers.doKeys('d', ',');
  eq('01239', cm.getValue());
}, { value: '0123456789'});
testVim('Fd,;', function(cm, vim, helpers) {
  cm.setCursor(0, 9);
  helpers.doKeys('F', '4');
  cm.setCursor(0, 9);
  helpers.doKeys('d', ';');
  eq('01239', cm.getValue());
  helpers.doKeys('u');
  cm.setCursor(0, 0);
  helpers.doKeys('d', ',');
  eq('56789', cm.getValue());
}, { value: '0123456789'});
testVim('td,;', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('t', '4');
  cm.setCursor(0, 0);
  helpers.doKeys('d', ';');
  eq('456789', cm.getValue());
  helpers.doKeys('u');
  cm.setCursor(0, 9);
  helpers.doKeys('d', ',');
  eq('012349', cm.getValue());
}, { value: '0123456789'});
testVim('Td,;', function(cm, vim, helpers) {
  cm.setCursor(0, 9);
  helpers.doKeys('T', '4');
  cm.setCursor(0, 9);
  helpers.doKeys('d', ';');
  eq('012349', cm.getValue());
  helpers.doKeys('u');
  cm.setCursor(0, 0);
  helpers.doKeys('d', ',');
  eq('456789', cm.getValue());
}, { value: '0123456789'});
testVim('fc,;', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('f', '4');
  cm.setCursor(0, 0);
  helpers.doKeys('c', ';', 'Esc');
  eq('56789', cm.getValue());
  helpers.doKeys('u');
  cm.setCursor(0, 9);
  helpers.doKeys('c', ',');
  eq('01239', cm.getValue());
}, { value: '0123456789'});
testVim('Fc,;', function(cm, vim, helpers) {
  cm.setCursor(0, 9);
  helpers.doKeys('F', '4');
  cm.setCursor(0, 9);
  helpers.doKeys('c', ';', 'Esc');
  eq('01239', cm.getValue());
  helpers.doKeys('u');
  cm.setCursor(0, 0);
  helpers.doKeys('c', ',');
  eq('56789', cm.getValue());
}, { value: '0123456789'});
testVim('tc,;', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('t', '4');
  cm.setCursor(0, 0);
  helpers.doKeys('c', ';', 'Esc');
  eq('456789', cm.getValue());
  helpers.doKeys('u');
  cm.setCursor(0, 9);
  helpers.doKeys('c', ',');
  eq('012349', cm.getValue());
}, { value: '0123456789'});
testVim('Tc,;', function(cm, vim, helpers) {
  cm.setCursor(0, 9);
  helpers.doKeys('T', '4');
  cm.setCursor(0, 9);
  helpers.doKeys('c', ';', 'Esc');
  eq('012349', cm.getValue());
  helpers.doKeys('u');
  cm.setCursor(0, 0);
  helpers.doKeys('c', ',');
  eq('456789', cm.getValue());
}, { value: '0123456789'});
testVim('fy,;', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('f', '4');
  cm.setCursor(0, 0);
  helpers.doKeys('y', ';', 'P');
  eq('012340123456789', cm.getValue());
  helpers.doKeys('u');
  cm.setCursor(0, 9);
  helpers.doKeys('y', ',', 'P');
  eq('012345678456789', cm.getValue());
}, { value: '0123456789'});
testVim('Fy,;', function(cm, vim, helpers) {
  cm.setCursor(0, 9);
  helpers.doKeys('F', '4');
  cm.setCursor(0, 9);
  helpers.doKeys('y', ';', 'p');
  eq('012345678945678', cm.getValue());
  helpers.doKeys('u');
  cm.setCursor(0, 0);
  helpers.doKeys('y', ',', 'P');
  eq('012340123456789', cm.getValue());
}, { value: '0123456789'});
testVim('ty,;', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys('t', '4');
  cm.setCursor(0, 0);
  helpers.doKeys('y', ';', 'P');
  eq('01230123456789', cm.getValue());
  helpers.doKeys('u');
  cm.setCursor(0, 9);
  helpers.doKeys('y', ',', 'p');
  eq('01234567895678', cm.getValue());
}, { value: '0123456789'});
testVim('Ty,;', function(cm, vim, helpers) {
  cm.setCursor(0, 9);
  helpers.doKeys('T', '4');
  cm.setCursor(0, 9);
  helpers.doKeys('y', ';', 'p');
  eq('01234567895678', cm.getValue());
  helpers.doKeys('u');
  cm.setCursor(0, 0);
  helpers.doKeys('y', ',', 'P');
  eq('01230123456789', cm.getValue());
}, { value: '0123456789'});
testVim('HML', function(cm, vim, helpers) {
  var lines = 35;
  var textHeight = cm.defaultTextHeight();
  cm.setSize(600, lines*textHeight);
  cm.setCursor(120, 0);
  helpers.doKeys('H');
  helpers.assertCursorAt(86, 2);
  helpers.doKeys('L');
  helpers.assertCursorAt(120, 4);
  helpers.doKeys('M');
  helpers.assertCursorAt(103,4);
}, { value: (function(){
  var lines = new Array(100);
  var upper = '  xx\n';
  var lower = '    xx\n';
  upper = lines.join(upper);
  lower = lines.join(lower);
  return upper + lower;
})()});

var zVals = ['zb','zz','zt','z-','z.','z<CR>'].map(function(e, idx){
  var lineNum = 250;
  var lines = 35;
  testVim(e, function(cm, vim, helpers) {
    var k1 = e[0];
    var k2 = e.substring(1);
    var textHeight = cm.defaultTextHeight();
    cm.setSize(600, lines*textHeight);
    cm.setCursor(lineNum, 0);
    helpers.doKeys(k1, k2);
    zVals[idx] = cm.getScrollInfo().top;
  }, { value: (function(){
    return new Array(500).join('\n');
  })()});
});
testVim('zb<zz', function(cm, vim, helpers){
  eq(zVals[0]<zVals[1], true);
});
testVim('zz<zt', function(cm, vim, helpers){
  eq(zVals[1]<zVals[2], true);
});
testVim('zb==z-', function(cm, vim, helpers){
  eq(zVals[0], zVals[3]);
});
testVim('zz==z.', function(cm, vim, helpers){
  eq(zVals[1], zVals[4]);
});
testVim('zt==z<CR>', function(cm, vim, helpers){
  eq(zVals[2], zVals[5]);
});

var squareBracketMotionSandbox = ''+
  '({\n'+//0
  '  ({\n'+//11
  '  /*comment {\n'+//2
  '            */(\n'+//3
  '#else                \n'+//4
  '  /*       )\n'+//5
  '#if        }\n'+//6
  '  )}*/\n'+//7
  ')}\n'+//8
  '{}\n'+//9
  '#else {{\n'+//10
  '{}\n'+//11
  '}\n'+//12
  '{\n'+//13
  '#endif\n'+//14
  '}\n'+//15
  '}\n'+//16
  '#else';//17
testVim('[[, ]]', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys(']', ']');
  helpers.assertCursorAt(9,0);
  helpers.doKeys('2', ']', ']');
  helpers.assertCursorAt(13,0);
  helpers.doKeys(']', ']');
  helpers.assertCursorAt(17,0);
  helpers.doKeys('[', '[');
  helpers.assertCursorAt(13,0);
  helpers.doKeys('2', '[', '[');
  helpers.assertCursorAt(9,0);
  helpers.doKeys('[', '[');
  helpers.assertCursorAt(0,0);
}, { value: squareBracketMotionSandbox});
testVim('[], ][', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doKeys(']', '[');
  helpers.assertCursorAt(12,0);
  helpers.doKeys('2', ']', '[');
  helpers.assertCursorAt(16,0);
  helpers.doKeys(']', '[');
  helpers.assertCursorAt(17,0);
  helpers.doKeys('[', ']');
  helpers.assertCursorAt(16,0);
  helpers.doKeys('2', '[', ']');
  helpers.assertCursorAt(12,0);
  helpers.doKeys('[', ']');
  helpers.assertCursorAt(0,0);
}, { value: squareBracketMotionSandbox});
testVim('[{, ]}', function(cm, vim, helpers) {
  cm.setCursor(4, 10);
  helpers.doKeys('[', '{');
  helpers.assertCursorAt(2,12);
  helpers.doKeys('2', '[', '{');
  helpers.assertCursorAt(0,1);
  cm.setCursor(4, 10);
  helpers.doKeys(']', '}');
  helpers.assertCursorAt(6,11);
  helpers.doKeys('2', ']', '}');
  helpers.assertCursorAt(8,1);
  cm.setCursor(0,1);
  helpers.doKeys(']', '}');
  helpers.assertCursorAt(8,1);
  helpers.doKeys('[', '{');
  helpers.assertCursorAt(0,1);
}, { value: squareBracketMotionSandbox});
testVim('[(, ])', function(cm, vim, helpers) {
  cm.setCursor(4, 10);
  helpers.doKeys('[', '(');
  helpers.assertCursorAt(3,14);
  helpers.doKeys('2', '[', '(');
  helpers.assertCursorAt(0,0);
  cm.setCursor(4, 10);
  helpers.doKeys(']', ')');
  helpers.assertCursorAt(5,11);
  helpers.doKeys('2', ']', ')');
  helpers.assertCursorAt(8,0);
  helpers.doKeys('[', '(');
  helpers.assertCursorAt(0,0);
  helpers.doKeys(']', ')');
  helpers.assertCursorAt(8,0);
}, { value: squareBracketMotionSandbox});
testVim('[*, ]*, [/, ]/', function(cm, vim, helpers) {
  ['*', '/'].forEach(function(key){
    cm.setCursor(7, 0);
    helpers.doKeys('2', '[', key);
    helpers.assertCursorAt(2,2);
    helpers.doKeys('2', ']', key);
    helpers.assertCursorAt(7,5);
  });
}, { value: squareBracketMotionSandbox});
testVim('[#, ]#', function(cm, vim, helpers) {
  cm.setCursor(10, 3);
  helpers.doKeys('2', '[', '#');
  helpers.assertCursorAt(4,0);
  helpers.doKeys('5', ']', '#');
  helpers.assertCursorAt(17,0);
  cm.setCursor(10, 3);
  helpers.doKeys(']', '#');
  helpers.assertCursorAt(14,0);
}, { value: squareBracketMotionSandbox});
testVim('[m, ]m, [M, ]M', function(cm, vim, helpers) {
  cm.setCursor(11, 0);
  helpers.doKeys('[', 'm');
  helpers.assertCursorAt(10,7);
  helpers.doKeys('4', '[', 'm');
  helpers.assertCursorAt(1,3);
  helpers.doKeys('5', ']', 'm');
  helpers.assertCursorAt(11,0);
  helpers.doKeys('[', 'M');
  helpers.assertCursorAt(9,1);
  helpers.doKeys('3', ']', 'M');
  helpers.assertCursorAt(15,0);
  helpers.doKeys('5', '[', 'M');
  helpers.assertCursorAt(7,3);
}, { value: squareBracketMotionSandbox});

// Ex mode tests
testVim('ex_go_to_line', function(cm, vim, helpers) {
  cm.setCursor(0, 0);
  helpers.doEx('4');
  helpers.assertCursorAt(3, 0);
}, { value: 'a\nb\nc\nd\ne\n'});
testVim('ex_write', function(cm, vim, helpers) {
  var tmp = CodeMirror.commands.save;
  var written;
  var actualCm;
  CodeMirror.commands.save = function(cm) {
    written = true;
    actualCm = cm;
  };
  // Test that w, wr, wri ... write all trigger :write.
  var command = 'write';
  for (var i = 1; i < command.length; i++) {
    written = false;
    actualCm = null;
    helpers.doEx(command.substring(0, i));
    eq(written, true);
    eq(actualCm, cm);
  }
  CodeMirror.commands.save = tmp;
});
testVim('ex_sort', function(cm, vim, helpers) {
  helpers.doEx('sort');
  eq('Z\na\nb\nc\nd', cm.getValue());
}, { value: 'b\nZ\nd\nc\na'});
testVim('ex_sort_reverse', function(cm, vim, helpers) {
  helpers.doEx('sort!');
  eq('d\nc\nb\na', cm.getValue());
}, { value: 'b\nd\nc\na'});
testVim('ex_sort_range', function(cm, vim, helpers) {
  helpers.doEx('2,3sort');
  eq('b\nc\nd\na', cm.getValue());
}, { value: 'b\nd\nc\na'});
testVim('ex_sort_oneline', function(cm, vim, helpers) {
  helpers.doEx('2sort');
  // Expect no change.
  eq('b\nd\nc\na', cm.getValue());
}, { value: 'b\nd\nc\na'});
testVim('ex_sort_ignoreCase', function(cm, vim, helpers) {
  helpers.doEx('sort i');
  eq('a\nb\nc\nd\nZ', cm.getValue());
}, { value: 'b\nZ\nd\nc\na'});
testVim('ex_sort_unique', function(cm, vim, helpers) {
  helpers.doEx('sort u');
  eq('Z\na\nb\nc\nd', cm.getValue());
}, { value: 'b\nZ\na\na\nd\na\nc\na'});
testVim('ex_sort_decimal', function(cm, vim, helpers) {
  helpers.doEx('sort d');
  eq('d3\n s5\n6\n.9', cm.getValue());
}, { value: '6\nd3\n s5\n.9'});
testVim('ex_sort_decimal_negative', function(cm, vim, helpers) {
  helpers.doEx('sort d');
  eq('z-9\nd3\n s5\n6\n.9', cm.getValue());
}, { value: '6\nd3\n s5\n.9\nz-9'});
testVim('ex_sort_decimal_reverse', function(cm, vim, helpers) {
  helpers.doEx('sort! d');
  eq('.9\n6\n s5\nd3', cm.getValue());
}, { value: '6\nd3\n s5\n.9'});
testVim('ex_sort_hex', function(cm, vim, helpers) {
  helpers.doEx('sort x');
  eq(' s5\n6\n.9\n&0xB\nd3', cm.getValue());
}, { value: '6\nd3\n s5\n&0xB\n.9'});
testVim('ex_sort_octal', function(cm, vim, helpers) {
  helpers.doEx('sort o');
  eq('.8\n.9\nd3\n s5\n6', cm.getValue());
}, { value: '6\nd3\n s5\n.9\n.8'});
testVim('ex_sort_decimal_mixed', function(cm, vim, helpers) {
  helpers.doEx('sort d');
  eq('y\nz\nc1\nb2\na3', cm.getValue());
}, { value: 'a3\nz\nc1\ny\nb2'});
testVim('ex_sort_decimal_mixed_reverse', function(cm, vim, helpers) {
  helpers.doEx('sort! d');
  eq('a3\nb2\nc1\nz\ny', cm.getValue());
}, { value: 'a3\nz\nc1\ny\nb2'});
testVim('ex_substitute_same_line', function(cm, vim, helpers) {
  cm.setCursor(1, 0);
  helpers.doEx('s/one/two');
  eq('one one\n two two', cm.getValue());
}, { value: 'one one\n one one'});
testVim('ex_substitute_global', function(cm, vim, helpers) {
  cm.setCursor(1, 0);
  helpers.doEx('%s/one/two');
  eq('two two\n two two', cm.getValue());
}, { value: 'one one\n one one'});
testVim('ex_substitute_input_range', function(cm, vim, helpers) {
  cm.setCursor(1, 0);
  helpers.doEx('1,3s/\\d/0');
  eq('0\n0\n0\n4', cm.getValue());
}, { value: '1\n2\n3\n4' });
testVim('ex_substitute_visual_range', function(cm, vim, helpers) {
  cm.setCursor(1, 0);
  // Set last visual mode selection marks '< and '> at lines 2 and 4
  helpers.doKeys('V', '2', 'j', 'v');
  helpers.doEx('\'<,\'>s/\\d/0');
  eq('1\n0\n0\n0\n5', cm.getValue());
}, { value: '1\n2\n3\n4\n5' });
testVim('ex_substitute_capture', function(cm, vim, helpers) {
  cm.setCursor(1, 0);
  helpers.doEx('s/(\\d+)/$1$1/')
  eq('a1111 a1212 a1313', cm.getValue());
}, { value: 'a11 a12 a13' });
testVim('ex_substitute_empty_query', function(cm, vim, helpers) {
  // If the query is empty, use last query.
  cm.setCursor(1, 0);
  cm.openDialog = helpers.fakeOpenDialog('1');
  helpers.doKeys('/');
  helpers.doEx('s//b');
  eq('abb ab2 ab3', cm.getValue());
}, { value: 'a11 a12 a13' });
testVim('ex_substitute_count', function(cm, vim, helpers) {
  cm.setCursor(1, 0);
  helpers.doEx('s/\\d/0/i 2');
  eq('1\n0\n0\n4', cm.getValue());
}, { value: '1\n2\n3\n4' });
testVim('ex_substitute_count_with_range', function(cm, vim, helpers) {
  cm.setCursor(1, 0);
  helpers.doEx('1,3s/\\d/0/ 3');
  eq('1\n2\n0\n0', cm.getValue());
}, { value: '1\n2\n3\n4' });
function testSubstituteConfirm(name, command, initialValue, expectedValue, keys, finalPos) {
  testVim(name, function(cm, vim, helpers) {
    var savedOpenDialog = cm.openDialog;
    var savedKeyName = CodeMirror.keyName;
    var onKeyDown;
    var recordedCallback;
    var closed = true; // Start out closed, set false on second openDialog.
    function close() {
      closed = true;
    }
    // First openDialog should save callback.
    cm.openDialog = function(template, callback, options) {
      recordedCallback = callback;
    }
    // Do first openDialog.
    helpers.doKeys(':');
    // Second openDialog should save keyDown handler.
    cm.openDialog = function(template, callback, options) {
      onKeyDown = options.onKeyDown;
      closed = false;
    };
    // Return the command to Vim and trigger second openDialog.
    recordedCallback(command);
    // The event should really use keyCode, but here just mock it out and use
    // key and replace keyName to just return key.
    CodeMirror.keyName = function (e) { return e.key; }
    keys = keys.toUpperCase();
    for (var i = 0; i < keys.length; i++) {
      is(!closed);
      onKeyDown({ key: keys.charAt(i) }, '', close);
    }
    try {
      eq(expectedValue, cm.getValue());
      helpers.assertCursorAt(finalPos);
      is(closed);
    } catch(e) {
      throw e
    } finally {
      // Restore overriden functions.
      CodeMirror.keyName = savedKeyName;
      cm.openDialog = savedOpenDialog;
    }
  }, { value: initialValue });
};
testSubstituteConfirm('ex_substitute_confirm_emptydoc',
    '%s/x/b/c', '', '', '', makeCursor(0, 0));
testSubstituteConfirm('ex_substitute_confirm_nomatch',
    '%s/x/b/c', 'ba a\nbab', 'ba a\nbab', '', makeCursor(0, 0));
testSubstituteConfirm('ex_substitute_confirm_accept',
    '%s/a/b/c', 'ba a\nbab', 'bb b\nbbb', 'yyy', makeCursor(1, 1));
testSubstituteConfirm('ex_substitute_confirm_random_keys',
    '%s/a/b/c', 'ba a\nbab', 'bb b\nbbb', 'ysdkywerty', makeCursor(1, 1));
testSubstituteConfirm('ex_substitute_confirm_some',
    '%s/a/b/c', 'ba a\nbab', 'bb a\nbbb', 'yny', makeCursor(1, 1));
testSubstituteConfirm('ex_substitute_confirm_all',
    '%s/a/b/c', 'ba a\nbab', 'bb b\nbbb', 'a', makeCursor(1, 1));
testSubstituteConfirm('ex_substitute_confirm_accept_then_all',
    '%s/a/b/c', 'ba a\nbab', 'bb b\nbbb', 'ya', makeCursor(1, 1));
testSubstituteConfirm('ex_substitute_confirm_quit',
    '%s/a/b/c', 'ba a\nbab', 'bb a\nbab', 'yq', makeCursor(0, 3));
testSubstituteConfirm('ex_substitute_confirm_last',
    '%s/a/b/c', 'ba a\nbab', 'bb b\nbab', 'yl', makeCursor(0, 3));
testSubstituteConfirm('ex_substitute_confirm_oneline',
    '1s/a/b/c', 'ba a\nbab', 'bb b\nbab', 'yl', makeCursor(0, 3));
testSubstituteConfirm('ex_substitute_confirm_range_accept',
    '1,2s/a/b/c', 'aa\na \na\na', 'bb\nb \na\na', 'yyy', makeCursor(1, 0));
testSubstituteConfirm('ex_substitute_confirm_range_some',
    '1,3s/a/b/c', 'aa\na \na\na', 'ba\nb \nb\na', 'ynyy', makeCursor(2, 0));
testSubstituteConfirm('ex_substitute_confirm_range_all',
    '1,3s/a/b/c', 'aa\na \na\na', 'bb\nb \nb\na', 'a', makeCursor(2, 0));
testSubstituteConfirm('ex_substitute_confirm_range_last',
    '1,3s/a/b/c', 'aa\na \na\na', 'bb\nb \na\na', 'yyl', makeCursor(1, 0));
//:noh should clear highlighting of search-results but allow to resume search through n
testVim('ex_noh_clearSearchHighlight', function(cm, vim, helpers) {
  cm.openDialog = helpers.fakeOpenDialog('match');
  helpers.doKeys('?');
  helpers.doEx('noh');
  eq(vim.searchState_.getOverlay(),null,'match-highlighting wasn\'t cleared');
  helpers.doKeys('n');
  helpers.assertCursorAt(0, 11,'can\'t resume search after clearing highlighting');
}, { value: 'match nope match \n nope Match' });
// TODO: Reset key maps after each test.
testVim('ex_map_key2key', function(cm, vim, helpers) {
  helpers.doEx('map a x');
  helpers.doKeys('a');
  helpers.assertCursorAt(0, 0);
  eq('bc', cm.getValue());
}, { value: 'abc' });
testVim('ex_map_key2key_to_colon', function(cm, vim, helpers) {
  helpers.doEx('map ; :');
  var dialogOpened = false;
  cm.openDialog = function() {
    dialogOpened = true;
  }
  helpers.doKeys(';');
  eq(dialogOpened, true);
});
testVim('ex_map_ex2key:', function(cm, vim, helpers) {
  helpers.doEx('map :del x');
  helpers.doEx('del');
  helpers.assertCursorAt(0, 0);
  eq('bc', cm.getValue());
}, { value: 'abc' });
testVim('ex_map_ex2ex', function(cm, vim, helpers) {
  helpers.doEx('map :del :w');
  var tmp = CodeMirror.commands.save;
  var written = false;
  var actualCm;
  CodeMirror.commands.save = function(cm) {
    written = true;
    actualCm = cm;
  };
  helpers.doEx('del');
  CodeMirror.commands.save = tmp;
  eq(written, true);
  eq(actualCm, cm);
});
testVim('ex_map_key2ex', function(cm, vim, helpers) {
  helpers.doEx('map a :w');
  var tmp = CodeMirror.commands.save;
  var written = false;
  var actualCm;
  CodeMirror.commands.save = function(cm) {
    written = true;
    actualCm = cm;
  };
  helpers.doKeys('a');
  CodeMirror.commands.save = tmp;
  eq(written, true);
  eq(actualCm, cm);
});
// Testing registration of functions as ex-commands and mapping to <Key>-keys
testVim('ex_api_test', function(cm, vim, helpers) {
  var res=false;
  var val='from';
  CodeMirror.Vim.defineEx('extest','ext',function(cm,params){
    if(params.args)val=params.args[0];
    else res=true;
  });
  helpers.doEx(':ext to');
  eq(val,'to','Defining ex-command failed');
  CodeMirror.Vim.map('<C-CR><Space>',':ext');
  helpers.doKeys('<C-CR>','<Space>');
  is(res,'Mapping to key failed');
});
// For now, this test needs to be last because it messes up : for future tests.
testVim('ex_map_key2key_from_colon', function(cm, vim, helpers) {
  helpers.doEx('map : x');
  helpers.doKeys(':');
  helpers.assertCursorAt(0, 0);
  eq('bc', cm.getValue());
}, { value: 'abc' });
