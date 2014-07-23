var swig = require('swig'),
  forTag = require('swig/lib/tags/for');

swig.setDefaults({
  cache: false
});

// Hack: Override for tag of Swig
swig.setTag('for', forTag.parse, function(compiler, args, content, parents, options, blockName){
  var compile = forTag.compile.apply(this, arguments).split('\n');

  compile.splice(3, 0, '  if (!Array.isArray(__l) && typeof __l.toArray === "function") { __l = __l.toArray(); }');

  return compile.join('\n');
}, forTag.ends, true);

module.exports = function(data, locals){
  return swig.render(data.text, {
    locals: locals,
    filename: data.path
  });
};