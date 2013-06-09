var renderer = require('./extend').renderer.list(),
  rendererSync = require('./extend').rendererSync.list(),
  helper = require('./extend').helper.list(),
  async = require('async'),
  fs = require('graceful-fs'),
  path = require('path'),
  _ = require('lodash'),
  util = require('./util'),
  file = util.file2,
  yfm = util.yfm,
  cache = {};

var getExtname = function(str){
  var extname = path.extname(str);
  if (extname) str = extname;

  if (str[0] === '.') str = str.substring(1);

  return str;
};

var isRenderable = exports.isRenderable = function(str){
  return renderer.hasOwnProperty(getExtname(str));
};

var isRenderableSync = exports.isRenderableSync = function(str){
  return rendererSync.hasOwnProperty(getExtname(str));
};

var getOutput = exports.getOutput = function(str){
  if (isRenderable(str)) return renderer[getExtname(str)].output;
};

var render = exports.render = function(data, options, callback){
  if (_.isFunction(options)){
    callback = options;
    options = {};
  }

  var text = data.text,
    source = data.path;

  async.series([
    function(next){
      if (_.isString(text)){
        next(null);
      } else if (source){
        file.readFile(source, function(err, content){
          if (err) return callback(err);
          if (!content) return callback();

          text = content;
          next();
        });
      } else {
        callback(new Error('No input file or string'));
      }
    },
    function(next){
      var ext = data.engine || path.extname(data.path).substring(1);

      if (ext && isRenderable(ext)){
        renderer[ext]({path: source, text: text}, options, callback);
      } else {
        callback(null, text);
      }
    }
  ]);
};

var renderSync = exports.renderSync = function(data, options){
  if (data.text){
    var text = data.text;
  } else if (data.path){
    var text = file.readFileSync(data.path);
    if (!text) return;
  } else {
    return;
  }

  var ext = data.engine || path.extname(data.path).substring(1);

  if (ext && isRenderableSync(ext)){
    return rendererSync[ext]({path: data.path, text: text}, options);
  } else {
    return text;
  }
};

var renderFile = exports.renderFile = function(source, options, callback){
  if (_.isFunction(options)){
    callback = options;
    options = {};
  }

  var ext = path.extname(source).substring(1);

  options.filename = source;

  async.waterfall([
    function(next){
      if (options.cache && cache.hasOwnProperty(source)){
        next(null, cache[source]);
      } else {
        file.readFile(source, function(err, content){
          if (err) return callback(err);
          var data = cache[source] = yfm(content);
          next(null, data);
        });
      }
    },
    function(data, next){
      var layout = data.hasOwnProperty('layout') ? data.layout : options.layout,
        content = data._content;

      delete data.layout;
      delete data._content;

      renderer[ext]({path: source, text: content}, _.extend(options, helper, data), function(err, result){
        if (err) return callback(err);
        if (!layout) return callback(null, result);

        var layoutPath = path.dirname(source) + '/' + layout;
        if (!path.extname(layoutPath)) layoutPath += '.' + ext;

        fs.exists(layoutPath, function(exist){
          if (!exist) return callback(null, result);

          renderFile(layoutPath, _.extend(_.clone(options), {body: result, layout: false}), callback);
        });
      });
    }
  ]);
};