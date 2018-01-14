'use strict';

var swig = require('swig-templates');
var extras = require('swig-extras');
var forTag = require('swig-templates/lib/tags/for');

extras.useTag(swig, 'markdown');
extras.useTag(swig, 'switch');
extras.useTag(swig, 'case');

extras.useFilter(swig, 'batch');
extras.useFilter(swig, 'groupby');
extras.useFilter(swig, 'markdown');
extras.useFilter(swig, 'nl2br');
extras.useFilter(swig, 'pluck');
extras.useFilter(swig, 'split');
extras.useFilter(swig, 'trim');
extras.useFilter(swig, 'truncate');

swig.setDefaults({
  cache: false,
  autoescape: false
});

// Hack: Override for tag of Swig
swig.setTag('for', forTag.parse, function(compiler, args, content, parents, options, blockName) {
  var compile = forTag.compile.apply(this, arguments).split('\n');

  compile.splice(3, 0, '  if (!Array.isArray(__l) && typeof __l.toArray === "function") { __l = __l.toArray(); }');

  return compile.join('\n');
}, forTag.ends, true);

function swigRenderer(data, locals) {
  return swig.render(data.text, {
    locals: locals,
    filename: data.path
  });
}

swigRenderer.compile = function(data, locals) {
  return swig.compile(data.text, {
    filename: data.path
  });
};

module.exports = swigRenderer;
