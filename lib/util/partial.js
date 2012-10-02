var fs = require('fs'),
  path = require('path'),
  _ = require('underscore'),
  cache = {};

var resolve = function(base, part){
  return path.resolve(path.dirname(base), path.extname(part) ? part : part + path.extname(base));
};

var render = exports.render = function(source, template, locals){
  var renderSync = require('../render').renderSync,
    extname = path.extname(source).substring(1);

  var newLocals = _.clone(locals);
  newLocals.partial = function(part){
    var partial = resolve(source, part);

    if (cache.hasOwnProperty(partial)){
      var content = cache[partial];
    } else {
      var content = fs.readFileSync(partial, 'utf8');
      cache[partial] = content;
    }

    var result = render(partial, fs.readFileSync(partial, 'utf8'), locals);

    return result;
  };

  var result = renderSync(template, extname, newLocals);
  return result;
};