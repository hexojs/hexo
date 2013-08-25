/**
 * Module dependencies.
 */

var async = require('async'),
  fs = require('graceful-fs'),
  pathFn = require('path'),
  _ = require('lodash'),
  util = require('../util'),
  file = util.file2,
  HexoError = require('../error');

var extend = hexo.extend,
  processors = extend.processor.list(),
  sourceDir = hexo.source_dir,
  log = hexo.log;

var model = hexo.model,
  Cache = model('Cache');

/**
 * Records processing files.
 */

var processingFiles = {};

/**
 * Parses the given `path` and returns matching processors.
 *
 * @param {String} path
 * @return {Array}
 * @api private
 */

var _getProcessor = function(path){
  var tasks = [];

  processors.forEach(function(item){
    var match = path.match(item.pattern);

    if (!match) return;

    var params = {};

    for (var i = 0, len = match.length; i < len; i++){
      var name = item.params[i - 1];

      params[i] = match[i];

      if (name) params[name] = match[i];
    }

    tasks.push({
      fn: item.fn,
      params: params
    });
  });

  return tasks;
};

/**
 * Processes source files.
 *
 * @param {Array|String} files
 * @param {Function} callback
 * @api public
 */

module.exports = function(files, callback){
  if (!Array.isArray(files)) files = [files];

  hexo.emit('processBefore');

  async.forEach(files, function(item, next){
    // Checks the type of the source file.
    if (_.isObject(item)){
      var path = item.path,
        type = item.type;
    } else {
      var path = item,
        type = 'update';
    }

    var source = pathFn.join(sourceDir, path);

    // Exits if the file is processing.
    if (processingFiles[source]) return next();

    path = path.replace(/\\/g, '/');

    // Checks whether the file exists.
    fs.exists(source, function(exist){
      if (!exist) return next();

      var tasks = _getProcessor(path);

      processingFiles[source] = true;

      async.forEach(tasks, function(task, next){
        var data = new Data(path, type, task.params);

        task.fn(data, function(err){
          if (err){
            if (err instanceof HexoError){
              return callback(err);
            } else {
              return callback(HexoError.wrap(err, 'Process failed: ' + path));
            }
          }

          next();
        });
      }, function(err){
        if (err) return callback(err);

        processingFiles[source] = false;
        log.d('Processed: ' + path);
        next();
      });
    });
  }, function(err){
    if (err) return callback(err);

    hexo.emit('processAfter');
    callback();
  });
};

/**
 * Creates a new instance.
 *
 * @param {String} path
 * @param {String} type
 * @param {Object} params
 * @api private
 */

var Data = function(path, type, params){
  this.path = path;
  this.source = pathFn.join(sourceDir, path);
  this.type = type;
  this.params = params;
};

/**
 * Reads file content.
 *
 * Options:
 *
 *   - `cache`: Enables cache
 *
 * @param {Object} options
 * @param {Function} callback
 */

Data.prototype.read = function(options, callback){
  if (!callback){
    if (typeof options === 'function'){
      callback = options;
      options = {};
    } else {
      callback = function(){};
    }
  }

  var options = _.extend({
    cache: false
  }, options);

  if (options.cache){
    Cache.loadCache(this.path, callback);
  } else {
    file.readFile(this.source, callback);
  }
};

/**
 * Reads file status.
 *
 * @param {Function} callback
 */

Data.prototype.stat = function(callback){
  fs.stat(this.source, callback);
};