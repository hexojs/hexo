var async = require('async'),
  pathFn = require('path'),
  _ = require('lodash'),
  util = require('./util'),
  file = util.file2,
  yfm = util.yfm;

var cache = {};

var Render = module.exports = function(core){
  this.core = core;
};

var getExtname = function(str){
  return pathFn.extname(str).substring(1);
};

Render.prototype.init = function(){
  this.renderer = this.core.extend.renderer.list();
  this.rendererSync = this.core.extend.renderer.list(true);
};

Render.prototype.isRenderable = function(path){
  return this.renderer.hasOwnProperty(getExtname(path));
};

Render.prototype.isRenderableSync = function(path){
  return this.rendererSync.hasOwnProperty(getExtname(path));
};

Render.prototype.getOutput = function(path){
  var renderer = this.renderer[getExtname(path)];
  if (renderer) return renderer.output;
};

Render.prototype.render = function(data, options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    } else {
      callback = function(){};
    }
  }

  var self = this;

  async.waterfall([
    function(next){
      if (data.text) return next(null, data.text);
      if (!data.path) return next(new Error('No input file or string'));

      file.readFile(data.path, next);
    },
    function(text, next){
      var ext = data.engine || getExtname(data.path);

      if (ext && self.renderer.hasOwnProperty(ext)){
        self.renderer[ext]({
          path: data.path,
          text: text
        }, options, next);
      } else {
        next(null, text);
      }
    }
  ], callback);
};

Render.prototype.renderSync = function(data, options){
  if (data.text){
    var text = data.text;
  } else if (data.path){
    var text = file.readFileSync(data.path);
    if (!text) return;
  } else {
    return;
  }

  var ext = data.engine || getExtname(data.path);

  if (ext && this.rendererSync.hasOwnProperty(ext)){
    return this.rendererSync[ext]({path: data.path, text: text}, options);
  } else {
    return text;
  }
};

Render.prototype.renderFile = function(source, options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    }
  }

  var ext = getExtname(source),
    self = this;

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

      var locals = _.extend({}, options, helper, data);

      self.renderer[ext]({path: source, text: content}, locals, function(err, result){
        if (err) return callback(err);
        if (!layout) return callback(null, result);

        var layoutPath = path.dirname(source) + '/' + layout;
        if (!path.extname(layoutPath)) layoutPath += '.' + ext;

        fs.exists(layoutPath, function(exist){
          if (!exist) return callback(null, result);

          self.renderFile(layoutPath, _.extend({}, locals, {body: result, layout: false}), callback);
        });
      });
    }
  ]);
};