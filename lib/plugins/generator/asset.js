var fs = require('graceful-fs'),
  pathFn = require('path'),
  async = require('async'),
  HexoError = require('../../error');

module.exports = function(locals, _render, callback){
  var baseDir = hexo.base_dir,
    renderFn = hexo.render,
    render = renderFn.render,
    isRenderable = renderFn.isRenderable,
    getOutput = renderFn.getOutput;

  async.each(hexo.model('Asset').toArray(), function(asset, next){
    var path = asset.path,
      source = pathFn.join(baseDir, asset._id);

    fs.exists(source, function(exist){
      if (!exist){
        asset.remove(function(){
          next();
        });

        return;
      }

      var dest = '',
        content;

      if (isRenderable(path)){
        var extname = pathFn.extname(path),
          filename = path.substring(0, path.length - extname.length),
          subext = pathFn.extname(filename);

        dest = filename + '.' + (subext ? subext.substring(1) : getOutput(path));

        content = function(callback){
          render({path: source}, function(err, result){
            if (err) return callback(HexoError.wrap(err, 'Asset render failed: ' + path));

            callback(null, result);
          });
        };
      } else {
        dest = path;

        content = function(fn){
          fn(null, fs.createReadStream(source));
        };
      }

      content.modified = asset.modified;
      hexo.route.set(dest, content);
      next();
    });
  }, callback);
};