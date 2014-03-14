var fs = require('graceful-fs'),
  pathFn = require('path'),
  async = require('async'),
  HexoError = require('../../error');

var generate = function(asset, callback){
  var path = asset.path,
    source = asset.full_source;

  fs.exists(source, function(exist){
    if (!exist){
      asset.remove();
      return callback();
    }

    var dest = '',
      content = {};

    if (hexo.render.isRenderable(path)){
      var extname = pathFn.extname(path),
        filename = path.substring(0, path.length - extname.length),
        subext = pathFn.extname(filename);

      dest = filename + '.' + (subext ? subext.substring(1) : hexo.render.getOutput(path));

      content = function(callback){
        hexo.render.render({path: source}, function(err, result){
          if (err) return callback(HexoError.wrap(err, 'Asset render failed: ' + path));

          callback(null, result);
        });
      };
    } else {
      dest = path;

      content = function(callback){
        callback(null, fs.createReadStream(source));
      };
    }

    content.modified = asset.modified;
    hexo.route.set(dest, content);
    callback();
  });
};

exports.asset = function(locals, render, callback){
  var arr = hexo.model('Asset').toArray();

  async.each(arr, generate, callback);
};

exports.post = function(locals, render, callback){
  var arr = hexo.model('PostAsset').toArray();

  async.each(arr, generate, callback);
};