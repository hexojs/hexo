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
  var locals = _.extend(_.clone(this), options),
    extname = path.extname(this.filename),
    viewDir = this.view_dir || this.settings.views;

  // Relative path
  var src = path.resolve(path.dirname(this.filename), view);
  if (!path.extname(src)) src += extname;

  if (fs.existsSync(src)){
    return render(src, locals);
  } else {
    if (!viewDir) return '';

    // Absolute path
    var src = path.join(viewDir, view);
    if (!path.extname(src)) src += extname;

    if (fs.existsSync(src)){
      return render(src, locals);
    } else {
      return '';
    }
  }
};