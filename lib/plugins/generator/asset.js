var fs = require('graceful-fs'),
  pathFn = require('path'),
  async = require('async'),
  HexoError = require('../../error');

var _generate = function(asset){
  var isRenderable = hexo.render.isRenderable,
    route = hexo.route,
    source = asset.full_source,
    path = asset.path;

  if (isRenderable(path)){
    var extname = pathFn.extname(path),
      filename = path.substring(0, path.length - extname.length),
      subext = pathFn.extname(filename),
      dest = filename + '.' + (subext ? subext.substring(1) : hexo.render.getOutput(path));

    var content = function(callback){
      hexo.render.render({path: source}, function(err, result){
        if (err) return callback(HexoError.wrap(err, 'Theme source render failed: ' + path));

        callback(null, result);
      });
    };
  } else {
    var dest = path;

    var content = function(callback){
      callback(null, fs.createReadStream(source));
    };
  }

  content.modified = asset.modified;
  route.set(dest, content);
};

exports.asset = function(locals, render, callback){
  hexo.model('Asset').each(function(asset){
    _generate(asset);
  });

  callback();
};

exports.post = function(locals, render, callback){
  hexo.model('PostAsset').each(function(asset){
    _generate(asset);
  });

  callback();
};