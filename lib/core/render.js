/**
* Render functions.
*
* @class render
* @module hexo
* @static
*/

var async = require('async'),
  pathFn = require('path'),
  fs = require('graceful-fs'),
  _ = require('lodash'),
  util = require('../util'),
  file = util.file2,
  yfm = util.yfm;

var cache = {};

var getExtname = function(str){
  return pathFn.extname(str).replace(/^\./, '');
};

/**
* Checks if the given `path` is renderable.
*
* @method isRenderable
* @param {String} path
* @return {Boolean}
* @static
*/

var isRenderable = exports.isRenderable = function(path){
  return hexo.extend.renderer.isRenderable(path);
};

/**
* Checks if the given `path` is renderable by synchronized renderer.
*
* @method isRenderableSync
* @param {String} path
* @return {Boolean}
* @static
*/

var isRenderableSync = exports.isRenderableSync = function(path){
  return hexo.extend.renderer.isRenderableSync(path);
};

/**
* Gets the output extension name.
*
* @method getOutput
* @param {String} path
* @return {String}
* @static
*/

var getOutput = exports.getOutput = function(path){
  return hexo.extend.renderer.getOutput(path);
};

/**
* Renders data.
*
* @method render
* @param {Object} data
* @param {Object} [options]
* @param {Function} [callback]
* @async
* @static
*/

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

      if (ext && isRenderable(ext)){
        var renderer = hexo.extend.renderer.get(ext);

        renderer({
          path: data.path,
          text: text
        }, options, next);
      } else {
        next(null, text);
      }
    }
  ], callback);
};

/**
* Renders data synchronizedly.
*
* @method renderSync
* @param {Object} data
* @param {Object} [options]
* @static
*/

exports.renderSync = function(data, options){
  var text = '';

  if (data.text != null){
    text = data.text;
  } else if (data.path){
    text = file.readFileSync(data.path);
    if (!text) return;
  } else {
    return;
  }

  var ext = data.engine || getExtname(data.path);

  if (ext && isRenderableSync(ext)){
    var renderer = hexo.extend.renderer.get(ext, true);

    return renderer({path: data.path, text: text}, options);
  } else {
    return text;
  }
};

/**
* Renders a file. This function supports helpers and layouts.
*
* @method renderFile
* @param {String} source
* @param {Object} [options]
* @param {Function} [callback]
* @async
* @static
*/

var renderFile = exports.renderFile = function(source, options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    } else {
      callback = function(){};
    }
  }

  var helper = hexo.extend.helper.list();

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
        extname = pathFn.extname(source),
        renderer = hexo.extend.renderer.get(extname);

      renderer({path: source, text: data._content}, locals, function(err, result){
        if (err) return callback(err);
        if (!layout) return callback(null, result);

        var layoutPath = '';

        // Relative path
        layoutPath = pathFn.resolve(source, layout);
        if (!pathFn.extname(layoutPath)) layoutPath += extname;

        var layoutLocals = _.extend({}, locals, {body: result, layout: false});

        fs.exists(layoutPath, function(exist){
          if (exist) return next(null, layoutPath, layoutLocals);

          var viewDir = options.view_dir || options.settings.views;

          if (!exist && !viewDir) return callback(null, result);

          // Absolute path
          layoutPath = pathFn.join(viewDir, layout);
          if (!pathFn.extname(layoutPath)) layoutPath += extname;

          fs.exists(layoutPath, function(exist){
            if (exist){
              next(null, layoutPath, layoutLocals);
            } else {
              callback(null, result);
            }
          });
        });
      });
    },
    // Wrap the template with layout
    function(layoutPath, locals, next){
      renderFile(layoutPath, locals, callback);
    }
  ]);
};