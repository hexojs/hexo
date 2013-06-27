(function() {
  "use strict";

  var Pos = CodeMirror.Pos;
  var svgNS = "http://www.w3.org/2000/svg";

  function DiffView(mv, type) {
    this.mv = mv;
    this.type = type;
    this.classes = type == "left"
      ? {chunk: "CodeMirror-diff-l-chunk",
         start: "CodeMirror-diff-l-chunk-start",
         end: "CodeMirror-diff-l-chunk-end",
         insert: "CodeMirror-diff-l-inserted",
         del: "CodeMirror-diff-l-deleted",
         connect: "CodeMirror-diff-l-connect"}
      : {chunk: "CodeMirror-diff-r-chunk",
         start: "CodeMirror-diff-r-chunk-start",
         end: "CodeMirror-diff-r-chunk-end",
         insert: "CodeMirror-diff-r-inserted",
         del: "CodeMirror-diff-r-deleted",
         connect: "CodeMirror-diff-r-connect"};
  }

  DiffView.prototype = {
    constructor: DiffView,
    init: function(pane, orig, options) {
      this.edit = this.mv.edit;
      this.orig = CodeMirror(pane, copyObj({value: orig, readOnly: true}, copyObj(options)));

      this.diff = getDiff(orig, options.value);
      this.diffOutOfDate = false;

      this.forceUpdate = registerUpdate(this);
      setScrollLock(this, true, false);
      registerScroll(this);
    }
  };

  function registerUpdate(dv) {
    var edit = {from: 0, to: 0, marked: []};
    var orig = {from: 0, to: 0, marked: []};
    var debounceChange;
    function update() {
      if (dv.diffOutOfDate) {
        dv.diff = getDiff(dv.orig.getValue(), dv.edit.getValue());
        dv.diffOutOfDate = false;
      }
      updateMarks(dv.edit, dv.diff, edit, DIFF_INSERT, dv.classes);
      updateMarks(dv.orig, dv.diff, orig, DIFF_DELETE, dv.classes);
      drawConnectors(dv);
    }
    function set(slow) {
      clearTimeout(debounceChange);
      debounceChange = setTimeout(update, slow == true ? 250 : 100);
    }
    dv.edit.on("change", function() {
      if (!dv.diffOutOfDate) {
        dv.diffOutOfDate = true;
        edit.from = edit.to = orig.from = orig.to = 0;
      }
      set(true);
    });
    dv.edit.on("viewportChange", set);
    dv.orig.on("viewportChange", set);
    update();
    return update;
  }

  function registerScroll(dv) {
    dv.edit.on("scroll", function() {
      syncScroll(dv, DIFF_INSERT) && drawConnectors(dv);
    });
    dv.orig.on("scroll", function() {
      syncScroll(dv, DIFF_DELETE) && drawConnectors(dv);
    });
  }

  function syncScroll(dv, type) {
    // Change handler will do a refresh after a timeout when diff is out of date
    if (dv.diffOutOfDate) return false;
    if (!dv.lockScroll) return true;
    var editor, other, now = +new Date;
    if (type == DIFF_INSERT) { editor = dv.edit; other = dv.orig; }
    else { editor = dv.orig; other = dv.edit; }
    // Don't take action if the position of this editor was recently set
    // (to prevent feedback loops)
    if (editor.state.scrollSetBy == dv && (editor.state.scrollSetAt || 0) + 50 > now) return false;

    var sInfo = editor.getScrollInfo(), halfScreen = .5 * sInfo.clientHeight, midY = sInfo.top + halfScreen;
    var mid = editor.lineAtHeight(midY, "local");
    var around = chunkBoundariesAround(dv.diff, mid, type == DIFF_INSERT);
    var off = getOffsets(editor, type == DIFF_INSERT ? around.edit : around.orig);
    var offOther = getOffsets(other, type == DIFF_INSERT ? around.orig : around.edit);
    var ratio = (midY - off.top) / (off.bot - off.top);
    other.scrollTo(null, (offOther.top - halfScreen) + ratio * (offOther.bot - offOther.top));
    other.state.scrollSetAt = now;
    other.state.scrollSetBy = dv;
    return true;
  }

  function getOffsets(editor, around) {
    var bot = around.after;
    if (bot == null) bot = editor.lastLine() + 1;
    return {top: editor.heightAtLine(around.before || 0, "local"),
            bot: editor.heightAtLine(bot, "local")};
  }

  function setScrollLock(dv, val, action) {
    dv.lockScroll = val;
    if (val && action != false) syncScroll(dv, DIFF_INSERT) && drawConnectors(dv);
    dv.lockButton.innerHTML = val ? "\u21db\u21da" : "\u21db&nbsp;&nbsp;\u21da";
  }

  // Updating the marks for editor content

  function clearMarks(editor, arr, classes) {
    for (var i = 0; i < arr.length; ++i) {
      var mark = arr[i];
      if (mark instanceof CodeMirror.TextMarker) {
        mark.clear();
      } else {
        editor.removeLineClass(mark, "background", classes.chunk);
        editor.removeLineClass(mark, "background", classes.start);
        editor.removeLineClass(mark, "background", classes.end);
      }
    }
    arr.length = 0;
  }

  // FIXME maybe add a margin around viewport to prevent too many updates
  function updateMarks(editor, diff, state, type, classes) {
    var vp = editor.getViewport();
    editor.operation(function() {
      if (state.from == state.to || vp.from - state.to > 20 || state.from - vp.to > 20) {
        clearMarks(editor, state.marked, classes);
        markChanges(editor, diff, type, state.marked, vp.from, vp.to, classes);
        state.from = vp.from; state.to = vp.to;
      } else {
        if (vp.from < state.from) {
          markChanges(editor, diff, type, state.marked, vp.from, state.from, classes);
          state.from = vp.from;
        }
        if (vp.to > state.to) {
          markChanges(editor, diff, type, state.marked, state.to, vp.to, classes);
          state.to = vp.to;
        }
      }
    });
  }

  function markChanges(editor, diff, type, marks, from, to, classes) {
    var pos = Pos(0, 0);
    var top = Pos(from, 0), bot = editor.clipPos(Pos(to - 1));
    var cls = type == DIFF_DELETE ? classes.del : classes.insert;
    function markChunk(start, end) {
      var bfrom = Math.max(from, start), bto = Math.min(to, end);
      for (var i = bfrom; i < bto; ++i) {
        var line = editor.addLineClass(i, "background", classes.chunk);
        if (i == start) editor.addLineClass(line, "background", classes.start);
        if (i == end - 1) editor.addLineClass(line, "background", classes.end);
        marks.push(line);
      }
      // When the chunk is empty, make sure a horizontal line shows up
      if (start == end && bfrom == end && bto == end) {
        if (bfrom)
          marks.push(editor.addLineClass(bfrom - 1, "background", classes.end));
        else
          marks.push(editor.addLineClass(bfrom, "background", classes.start));
      }
    }

    var chunkStart = 0;
    for (var i = 0; i < diff.length; ++i) {
      var part = diff[i], tp = part[0], str = part[1];
      if (tp == DIFF_EQUAL) {
        var cleanFrom = pos.line + (startOfLineClean(diff, i) ? 0 : 1);
        moveOver(pos, str);
        var cleanTo = pos.line + (endOfLineClean(diff, i) ? 1 : 0);
        if (cleanTo > cleanFrom) {
          if (i) markChunk(chunkStart, cleanFrom);
          chunkStart = cleanTo;
        }
      } else {
        if (tp == type) {
          var end = moveOver(pos, str, true);
          var a = posMax(top, pos), b = posMin(bot, end);
          if (!posEq(a, b))
            marks.push(editor.markText(a, b, {className: cls}));
          pos = end;
        }
      }
    }
    if (chunkStart <= pos.line) markChunk(chunkStart, pos.line + 1);
  }

  // Updating the gap between editor and original

  function drawConnectors(dv) {
    if (dv.svg) {
      clear(dv.svg);
      var w = dv.gap.offsetWidth;
      attrs(dv.svg, "width", w, "height", dv.gap.offsetHeight);
    }
    clear(dv.copyButtons);

    var flip = dv.type == "left";
    var vpEdit = dv.edit.getViewport(), vpOrig = dv.orig.getViewport();
    var sTopEdit = dv.edit.getScrollInfo().top, sTopOrig = dv.orig.getScrollInfo().top;
    iterateChunks(dv.diff, function(topOrig, botOrig, topEdit, botEdit) {
      if (topEdit >= vpEdit.to || botEdit < vpEdit.from ||
          topOrig >= vpOrig.to || botOrig < vpOrig.from)
        return;
      var topLpx = dv.orig.heightAtLine(topOrig, "local") - sTopOrig, top = topLpx;
      if (dv.svg) {
        var topRpx = dv.edit.heightAtLine(topEdit, "local") - sTopEdit;
        if (flip) { var tmp = topLpx; topLpx = topRpx; topRpx = tmp; }
        var botLpx = dv.orig.heightAtLine(botOrig, "local") - sTopOrig;
        var botRpx = dv.edit.heightAtLine(botEdit, "local") - sTopEdit;
        if (flip) { var tmp = botLpx; botLpx = botRpx; botRpx = tmp; }
        var curveTop = " C " + w/2 + " " + topRpx + " " + w/2 + " " + topLpx + " " + (w + 2) + " " + topLpx;
        var curveBot = " C " + w/2 + " " + botLpx + " " + w/2 + " " + botRpx + " -1 " + botRpx;
        attrs(dv.svg.appendChild(document.createElementNS(svgNS, "path")),
              "d", "M -1 " + topRpx + curveTop + " L " + (w + 2) + " " + botLpx + curveBot + " z",
              "class", dv.classes.connect);
      }
      var copy = dv.copyButtons.appendChild(elt("div", dv.type == "left" ? "\u21dd" : "\u21dc",
                                                "CodeMirror-diff-copy"));
      copy.title = "Revert chunk";
      copy.chunk = {topEdit: topEdit, botEdit: botEdit, topOrig: topOrig, botOrig: botOrig};
      copy.style.top = top + "px";
    });
  }

  function copyChunk(dv, chunk) {
    if (dv.diffOutOfDate) return;
    dv.edit.replaceRange(dv.orig.getRange(Pos(chunk.topOrig, 0), Pos(chunk.botOrig, 0)),
                         Pos(chunk.topEdit, 0), Pos(chunk.botEdit, 0));
  }

  // Merge view, containing 0, 1, or 2 diff views.

  var MergeView = CodeMirror.MergeView = function(node, options) {
    if (!(this instanceof MergeView)) return new MergeView(node, options);

    var origLeft = options.origLeft, origRight = options.origRight == null ? options.orig : options.origRight;
    var hasLeft = origLeft != null, hasRight = origRight != null;
    var panes = 1 + (hasLeft ? 1 : 0) + (hasRight ? 1 : 0);
    var wrap = [], left = this.left = null, right = this.right = null;

    if (hasLeft) {
      left = this.left = new DiffView(this, "left");
      var leftPane = elt("div", null, "CodeMirror-diff-pane");
      wrap.push(leftPane);
      wrap.push(buildGap(left));
    }

    var editPane = elt("div", null, "CodeMirror-diff-pane");
    wrap.push(editPane);

    if (hasRight) {
      right = this.right = new DiffView(this, "right");
      wrap.push(buildGap(right));
      var rightPane = elt("div", null, "CodeMirror-diff-pane");
      wrap.push(rightPane);
    }

    wrap.push(elt("div", null, null, "height: 0; clear: both;"));
    var wrapElt = this.wrap = node.appendChild(elt("div", wrap, "CodeMirror-diff CodeMirror-diff-" + panes + "pane"));
    this.edit = CodeMirror(editPane, copyObj(options));

    if (left) left.init(leftPane, origLeft, options);
    if (right) right.init(rightPane, origRight, options);

    var onResize = function() {
      if (left) drawConnectors(left);
      if (right) drawConnectors(right);
    };
    CodeMirror.on(window, "resize", onResize);
    var resizeInterval = setInterval(function() {
      for (var p = wrapElt.parentNode; p && p != document.body; p = p.parentNode) {}
      if (!p) { clearInterval(resizeInterval); CodeMirror.off(window, "resize", onResize); }
    }, 5000);
  };

  function buildGap(dv) {
    var lock = dv.lockButton = elt("div", null, "CodeMirror-diff-scrolllock");
    lock.title = "Toggle locked scrolling";
    var lockWrap = elt("div", [lock], "CodeMirror-diff-scrolllock-wrap");
    CodeMirror.on(lock, "click", function() { setScrollLock(dv, !dv.lockScroll); });
    dv.copyButtons = elt("div", null, "CodeMirror-diff-copybuttons-" + dv.type);
    CodeMirror.on(dv.copyButtons, "click", function(e) {
      var node = e.target || e.srcElement;
      if (node.chunk) copyChunk(dv, node.chunk);
    });
    var gapElts = [dv.copyButtons, lockWrap];
    var svg = document.createElementNS && document.createElementNS(svgNS, "svg");
    if (svg && !svg.createSVGRect) svg = null;
    dv.svg = svg;
    if (svg) gapElts.push(svg);

    return dv.gap = elt("div", gapElts, "CodeMirror-diff-gap");
  }

  MergeView.prototype = {
    constuctor: MergeView,
    editor: function() { return this.edit; },
    rightOriginal: function() { return this.right && this.right.orig; },
    leftOriginal: function() { return this.left && this.left.orig; }
  };

  // Operations on diffs

  var dmp = new diff_match_patch();
  function getDiff(a, b) {
    var diff = dmp.diff_main(a, b);
    dmp.diff_cleanupSemantic(diff);
    // The library sometimes leaves in empty parts, which confuse the algorithm
    for (var i = 0; i < diff.length; ++i) {
      var part = diff[i];
      if (!part[1]) {
        diff.splice(i--, 1);
      } else if (i && diff[i - 1][0] == part[0]) {
        diff.splice(i--, 1);
        diff[i][1] += part[1];
      }
    }
    return diff;
  }

  function iterateChunks(diff, f) {
    var startEdit = 0, startOrig = 0;
    var edit = Pos(0, 0), orig = Pos(0, 0);
    for (var i = 0; i < diff.length; ++i) {
      var part = diff[i], tp = part[0];
      if (tp == DIFF_EQUAL) {
        var startOff = startOfLineClean(diff, i) ? 0 : 1;
        var cleanFromEdit = edit.line + startOff, cleanFromOrig = orig.line + startOff;
        moveOver(edit, part[1], null, orig);
        var endOff = endOfLineClean(diff, i) ? 1 : 0;
        var cleanToEdit = edit.line + endOff, cleanToOrig = orig.line + endOff;
        if (cleanToEdit > cleanFromEdit) {
          if (i) f(startOrig, cleanFromOrig, startEdit, cleanFromEdit);
          startEdit = cleanToEdit; startOrig = cleanToOrig;
        }
      } else {
        moveOver(tp == DIFF_INSERT ? edit : orig, part[1]);
      }
    }
    if (startEdit <= edit.line || startOrig <= orig.line)
      f(startOrig, orig.line + 1, startEdit, edit.line + 1);
  }

  function endOfLineClean(diff, i) {
    if (i == diff.length - 1) return true;
    var next = diff[i + 1][1];
    if (next.length == 1 || next.charCodeAt(0) != 10) return false;
    if (i == diff.length - 2) return true;
    next = diff[i + 2][1];
    return next.length > 1 && next.charCodeAt(0) == 10;
  }

  function startOfLineClean(diff, i) {
    if (i == 0) return true;
    var last = diff[i - 1][1];
    if (last.charCodeAt(last.length - 1) != 10) return false;
    if (i == 1) return true;
    last = diff[i - 2][1];
    return last.charCodeAt(last.length - 1) == 10;
  }

  function chunkBoundariesAround(diff, n, nInEdit) {
    var beforeE, afterE, beforeO, afterO;
    iterateChunks(diff, function(fromOrig, toOrig, fromEdit, toEdit) {
      var fromLocal = nInEdit ? fromEdit : fromOrig;
      var toLocal = nInEdit ? toEdit : toOrig;
      if (afterE == null) {
        if (fromLocal > n) { afterE = fromEdit; afterO = fromOrig; }
        else if (toLocal > n) { afterE = toEdit; afterO = toOrig; }
      }
      if (toLocal <= n) { beforeE = toEdit; beforeO = toOrig; }
      else if (fromLocal <= n) { beforeE = fromEdit; beforeO = fromOrig; }
    });
    return {edit: {before: beforeE, after: afterE}, orig: {before: beforeO, after: afterO}};
  }

  // General utilities

  function elt(tag, content, className, style) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (style) e.style.cssText = style;
    if (typeof content == "string") e.appendChild(document.createTextNode(content));
    else if (content) for (var i = 0; i < content.length; ++i) e.appendChild(content[i]);
    return e;
  }

  function clear(node) {
    for (var count = node.childNodes.length; count > 0; --count)
      node.removeChild(node.firstChild);
  }

  function attrs(elt) {
    for (var i = 1; i < arguments.length; i += 2)
      elt.setAttribute(arguments[i], arguments[i+1]);
  }

  function copyObj(obj, target) {
    if (!target) target = {};
    for (var prop in obj) if (obj.hasOwnProperty(prop)) target[prop] = obj[prop];
    return target;
  }

  function moveOver(pos, str, copy, other) {
    var out = copy ? Pos(pos.line, pos.ch) : pos, at = 0;
    for (;;) {
      var nl = str.indexOf("\n", at);
      if (nl == -1) break;
      ++out.line;
      if (other) ++other.line;
      at = nl + 1;
    }
    out.ch = (at ? 0 : out.ch) + (str.length - at);
    if (other) other.ch = (at ? 0 : other.ch) + (str.length - at);
    return out;
  }

  function posMin(a, b) { return (a.line - b.line || a.ch - b.ch) < 0 ? a : b; }
  function posMax(a, b) { return (a.line - b.line || a.ch - b.ch) > 0 ? a : b; }
  function posEq(a, b) { return a.line == b.line && a.ch == b.ch; }
})();
