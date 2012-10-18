var extend = require('../extend'),
  renderSync = require('../render').renderSync,
  fs = require('fs'),
  path = require('path'),
  _ = require('underscore'),
  cache = {};

var resolve = function(base, part){
  return path.resolve(path.dirname(base), path.extname(part) ? part : part + path.extname(base));
};

var render = function(source, template, locals){
  return function(part, options){
    var partial = resolve(source, part),
      extname = path.extname(partial).substring(1);

    if (cache.hasOwnProperty(partial)){
      var content = cache[partial];
    } else {
      var content = fs.readFileSync(partial, 'utf8');
      cache[partial] = content;
    }

    var newLocals = _.clone(locals);
    newLocals.partial = render(partial, content, locals);

    return renderSync(content, extname, _.extend(newLocals, options));
  }
};

extend.helper.register('partial', render);