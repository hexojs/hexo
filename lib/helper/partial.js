var extend = require('../extend'),
  renderSync = require('../render').renderSync,
  util = require('../util'),
  file = util.file,
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
      var content = file.readSync(partial, 'utf8');
      cache[partial] = content;
    }

    var newLocals = _.clone(locals);
    newLocals.partial = render(partial, content, _.extend(locals, options));

    return renderSync(content, extname, _.extend(newLocals, options));
  }
};

extend.helper.register('partial', render);