var path = require('path'),
  fs = require('graceful-fs'),
  _ = require('lodash'),
  util = require('../../util'),
  file = util.file2;

if (!fs.exists || !fs.existsSync){
  fs.exists = path.exists;
  fs.existsSync = path.existsSync;
}

var cache = {};

var resolve = function(base, part){
  return path.resolve(path.dirname(base), path.extname(part) ? part : part + path.extname(base));
};

var render = function(src, options){
  if (options.cache && cache.hasOwnProperty(src)){
    var content = cache[src];
  } else {
    try {
      var content = file.readFileSync(src);
      if (options.cache) cache[src] = content;
    } catch (err){
      throw err;
    }
  }

  if (!content) return '';

  return hexo.render.renderSync({text: content, path: src}, _.extend(options, {filename: src}));
};

module.exports = function(view, options){
  var src = resolve(this.filename, view),
    locals = _.extend(_.clone(this), options);

  if (fs.existsSync(src)){
    return render(src, locals);
  } else {
    var src = path.join(hexo.theme_dir, 'layout', view);

    if (fs.existsSync(src)){
      return render(src, locals);
    } else {
      return '';
    }
  }
};