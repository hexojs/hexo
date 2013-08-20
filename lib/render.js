var async = require('async'),
  pathFn = require('path'),
  fs = require('graceful-fs'),
  _ = require('lodash'),
  util = require('./util'),
  file = util.file2,
  yfm = util.yfm;

var extend = hexo.extend,
  renderer = extend.renderer.list(),
  rendererSync = extend.renderer.list(true),
  helper = extend.helper.list();

var cache = {};

var getExtname = function(str){
  return pathFn.extname(str).substring(1);
};

exports.isRenderable = function(path){
  return renderer.hasOwnProperty(getExtname(path));
};

exports.isRenderableSync = function(path){
  return rendererSync.hasOwnProperty(getExtname(path));
};

exports.getOutput = function(path){
  var r = renderer[getExtname(path)];
  if (r) return r.output;
};

var render = exports.render = function(data, options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    } else {
      callback = function(){};
    }
  }

  async.waterfall([
    function(next){
      if (data.text != null) return next(null, data.text);
      if (!data.path) return next(new Error('No input file or string'));

      file.readFile(data.path, next);
    },
    function(text, next){
      var ext = data.engine || getExtname(data.path);

      if (ext && renderer.hasOwnProperty(ext)){
        renderer[ext]({
          path: data.path,
          text: text
        }, options, next);
      } else {
        next(null, text);
      }
    }
  ], callback);
};

exports.renderSync = function(data, options){
  if (data.text != null){
    var text = data.text;
  } else if (data.path){
    var text = file.readFileSync(data.path);
    if (!text) return;
  } else {
    return;
  }

  var ext = data.engine || getExtname(data.path);

  if (ext && rendererSync.hasOwnProperty(ext)){
    return rendererSync[ext]({path: data.path, text: text}, options);
  } else {
    return text;
  }
};

var renderFile = exports.renderFile = function(source, options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    }
  }

  async.waterfall([
    // Load cache
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
    // Render template
    function(data, next){
      var layout = data.hasOwnProperty('layout') ? data.layout : options.layout,
        locals = _.extend({}, helper, options, _.omit(data, 'layout', '_content')),
        extname = pathFn.extname(source);

      renderer[extname.substring(1)]({path: source, text: data._content}, locals, function(err, result){
        if (err) return callback(err);
        if (!layout) return callback(null, result);

        // Relative path
        var layoutPath = pathFn.resolve(source, layout);
        if (!pathFn.extname(layoutPath)) layoutPath += extname;

        var layoutLocals = _.extend({}, locals, {body: result, layout: false});

        fs.exists(layoutPath, function(exist){
          if (exist) return next(null, layoutPath, layoutLocals);

          var viewDir = options.view_dir || options.settings.views;

          if (!exist && !viewDir) return callback(null, result);

          // Absolute path
          var layoutPath = pathFn.join(viewDir, layout);
          if (!pathFn.extname(layoutPath)) layoutPath += extname;

          fs.exists(layoutPath, function(exist){
            if (exist){
              next(null, layoutPath, layoutLocals);
            } else {
              callback(null, result);
            }
          })
        });
      });
    },
    // Wrap the template with layout
    function(layoutPath, locals, next){
      renderFile(layoutPath, locals, callback);
    }
  ]);
};