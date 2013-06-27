/*
 Simple linter, based on the Acorn [1] parser module

 All of the existing linters either cramp my style or have huge
 dependencies (Closure). So here's a very simple, non-invasive one
 that only spots

  - missing semicolons and trailing commas
  - variables or properties that are reserved words
  - assigning to a variable you didn't declare

 [1]: https://github.com/marijnh/acorn/
*/

var fs = require("fs"), acorn = require("./acorn.js"), walk = require("./walk.js");

var scopePasser = walk.make({
  ScopeBody: function(node, prev, c) { c(node, node.scope); }
});

function checkFile(fileName) {
  var file = fs.readFileSync(fileName, "utf8"), notAllowed;
  if (notAllowed = file.match(/[\x00-\x08\x0b\x0c\x0e-\x19\uFEFF\t]|[ \t]\n/)) {
    var msg;
    if (notAllowed[0] == "\t") msg = "Found tab character";
    else if (notAllowed[0].indexOf("\n") > -1) msg = "Trailing whitespace";
    else msg = "Undesirable character " + notAllowed[0].charCodeAt(0);
    var info = acorn.getLineInfo(file, notAllowed.index);
    fail(msg + " at line " + info.line + ", column " + info.column, {source: fileName});
  }

  try {
    var parsed = acorn.parse(file, {
      locations: true,
      ecmaVersion: 3,
      strictSemicolons: true,
      allowTrailingCommas: false,
      forbidReserved: true,
      sourceFile: fileName
    });
  } catch (e) {
    fail(e.message, {source: fileName});
    return;
  }

  var scopes = [];

  walk.simple(parsed, {
    ScopeBody: function(node, scope) {
      node.scope = scope;
      scopes.push(scope);
    }
  }, walk.scopeVisitor, {vars: Object.create(null)});

  var ignoredGlobals = Object.create(null);

  function inScope(name, scope) {
    for (var cur = scope; cur; cur = cur.prev)
      if (name in cur.vars) return true;
  }
  function checkLHS(node, scope) {
    if (node.type == "Identifier" && !(node.name in ignoredGlobals) &&
        !inScope(node.name, scope)) {
      ignoredGlobals[node.name] = true;
      fail("Assignment to global variable", node.loc);
    }
  }

  walk.simple(parsed, {
    UpdateExpression: function(node, scope) {checkLHS(node.argument, scope);},
    AssignmentExpression: function(node, scope) {checkLHS(node.left, scope);},
    Identifier: function(node, scope) {
      // Mark used identifiers
      for (var cur = scope; cur; cur = cur.prev)
        if (node.name in cur.vars) {
          cur.vars[node.name].used = true;
          return;
        }
    },
    FunctionExpression: function(node) {
      if (node.id) fail("Named function expression", node.loc);
    }
  }, scopePasser);

  for (var i = 0; i < scopes.length; ++i) {
    var scope = scopes[i];
    for (var name in scope.vars) {
      var info = scope.vars[name];
      if (!info.used && info.type != "catch clause" && info.type != "function name" && name.charAt(0) != "_")
        fail("Unused " + info.type + " " + name, info.node.loc);
    }
  }
}

var failed = false;
function fail(msg, pos) {
  if (pos.start) msg += " (" + pos.start.line + ":" + pos.start.column + ")";
  console.log(pos.source + ": " + msg);
  failed = true;
}

function checkDir(dir) {
  fs.readdirSync(dir).forEach(function(file) {
    var fname = dir + "/" + file;
    if (/\.js$/.test(file)) checkFile(fname);
    else if (file != "dep" && fs.lstatSync(fname).isDirectory()) checkDir(fname);
  });
}

exports.checkDir = checkDir;
exports.checkFile = checkFile;
exports.success = function() { return !failed; };
