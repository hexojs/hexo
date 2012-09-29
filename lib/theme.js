var render = require('./render'),
  util = require('./util'),
  file = util.file,
  yfm = util.yfm,
  async = require('async'),
  path = require('path'),
  _ = require('underscore'),
  extCache = {};

var config = exports.config = {};

exports.init = function(callback){
  render.compile(hexo.theme_dir + 'config.yml', function(err, file){
    if (err) throw err;

    if (file){
      for (var i in file){
        (function(i){
          config.__defineGetter__(i, function(){
            return file[i];
          });
        })(i);

        callback();
      }
      console.log(file);
    } else {
      callback();
    }
  });
};

var layout = exports.layout = {};

exports.assets = function(callback){
  var themeDir = hexo.theme_dir,
    publicDir = hexo.public_dir,
    cache = {};

  file.dir(themeDir, function(files){
    async.forEach(files, function(item, next){
      var extname = path.extname(item),
        filename = path.basename(item, extname),
        dirs = path.dirname(item).split('/');

      if (dirs[0] === 'layout'){
        file.read(themeDir + item, function(err, file){
          if (err) throw err;
          cache[filename] = yfm(file);
          extCache[filename] = extname.substring(1);
          next(null);
        });
      } else {
        if (item.substring(0, 1) === '_'){
          next(null);
        } else {
          render.compile(themeDir + item, function(err, result){
            if (err) throw err;
            file.write(publicDir + item, result, next);
          });
        }
      }
    }, function(){
      async.forEach(Object.keys(cache), function(key, next){
        var item = cache[key];

        if (item.layout && cache.hasOwnProperty(item.layout)){
          render.render(cache[item.layout], {body: item._content}, function(err, result){
            if (err) throw err;
            layout.__defineGetter__(key, function(){
              return result;
            });
            next(null);
          });
        } else {
          layout.__defineGetter__(key, function(){
            return item._content;
          });
          next(null);
        }
      }, callback);
    });
  })
};

exports.render = function(template, locals, callback){
  if (_.isFunction(locals)){
    callback = locals;
    locals = {};
  }

  render.render(layout[template], extCache[template], locals, callback);
};