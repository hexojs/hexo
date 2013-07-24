/**
 * Module dependencies.
 */

var renderer = require('./extend').renderer.list(),
  rendererSync = require('./extend').rendererSync.list(),
  helper = require('./extend').helper.list(),
  async = require('async'),
  fs = require('graceful-fs'),
  path = require('path'),
  _ = require('lodash'),
  util = require('./util'),
  file = util.file2,
  yfm = util.yfm;

/**
 * Layout cache.
 */

var cache = {};

/**
 * Gets the extension of the renderer.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

var getExtname = function(str){
  var extname = path.extname(str);
  if (extname) str = extname;

  if (str[0] === '.') str = str.substring(1);

  return str;
};

/**
 * Checks if the given `path` can be rendered.
 *
 * @param {String} path
 * @return {Boolean}
 * @api public
 */

var isRenderable = exports.isRenderable = function(path){
  return renderer.hasOwnProperty(getExtname(path));
};

/**
 * Checks if the given `path` can be rendered synchronously.
 *
 * @param {String} path
 * @return {Boolean}
 * @api public
 */

var isRenderableSync = exports.isRenderableSync = function(path){
  return rendererSync.hasOwnProperty(getExtname(path));
};

/**
 * Returns the output extension of renderer.
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

var getOutput = exports.getOutput = function(path){
  if (isRenderable(path)) return renderer[getExtname(path)].output;
};

/**
 * Renders the given `data`.
 * `data` should have `text` or `path` property at least.
 * `callback` is invoked with an error object and the rendered string.
 *
 * @param {Object} data
 * @param {Object} options
 * @param {Function} callback
 * @api public
 */

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

/**
 * Renders the given `data` synchronously.
 * `data` should have `text` or `path` property at least.
 *
 * @param {Object} data
 * @param {Object} options
 * @return {String}
 * @api public
 */

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

/**
 * Renders the given `source`.
 * `callback` is invoked with an error object and the rendered string.
 *
 * @param {String} source
 * @param {Object} options
 * @param {Function} callback
 * @api public
 */

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