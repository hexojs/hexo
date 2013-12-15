/**
* Source functions.
*
* @class source
* @since 2.4.0
* @module hexo
* @namespace Hexo
* @static
*/

var async = require('async'),
  fs = require('graceful-fs'),
  pathFn = require('path'),
  _ = require('lodash'),
  HexoError = require('../error'),
  util = require('../util'),
  file = util.file2;

var rTmpFile = /[~%]$/;

var isRunning = false,
  isReady = false,
  processingFiles = {};

var _getProcessor = function(path){
  var tasks = [];

  hexo.extend.processor.list().forEach(function(processor){
    var match = path.match(processor.pattern);

    if (!match) return;

    var params = {};

    for (var i = 0, len = match.length; i < len; i++){
      var name = processor.params[i - 1];

      params[i] = match[i];

      if (name) params[name] = match[i];
    }

    tasks.push({
      fn: processor.fn,
      params: params
    });
  });

  return tasks;
};

var _saveDatabase = function(callback){
  if (typeof callback !== 'function') callback = function(){};

  var model = hexo.model;

  var store = {
    Asset: model('Asset')._store.list(),
    Cache: model('Cache')._store.list()
  };

  file.writeFile(pathFn.join(hexo.base_dir, 'db.json'), JSON.stringify(store), function(err){
    if (err) return callback(HexoError.wrap(err, 'Cache save failed'));

    hexo.log.d('Cache saved');
    callback();
  });
};

/**
* Loads source files.
*
* @method load
* @param {Function} [callback]
* @async
* @static
*/

exports.load = function(callback){
  if (typeof callback !== 'function') callback = function(){};
  if (isRunning || isReady) return callback();

  async.waterfall([
    function(next){
      file.list(hexo.source_dir, {ignorePattern: rTmpFile}, next);
    },
    function(files, next){
      process(files, next);
    },
    function(next){
      _saveDatabase(next);
    }
  ], function(err){
    isRunning = false;

    if (err) return callback(HexoError.wrap(err, 'Source load failed'));

    isReady = true;

    callback();
  });
};

/**
* Watches source files.
*
* @method watch
* @param {Function} [callback]
* @async
* @static
*/

exports.watch = function(callback){
  if (typeof callback !== 'function') callback = function(){};
  if (!isReady) return;

  var queue = [],
    isRunning = false,
    timer;

  var timerFn = function(){
    if (queue.length && !isRunning){
      isRunning = true;

      async.series([
        function(next){
          process(queue.splice(0, queue.length), next);
        },
        function(next){
          _saveDatabase(next);
        }
      ], function(err){
        if (err) hexo.log.e(err);

        isRunning = false;
        callback();
      });
    }
  };

  file.watch(hexo.source_dir, {ignorePattern: rTmpFile}, function(type, src, stats){
    if (type === 'error') return hexo.log.e('Source watch error: ' + src);

    var data = {
      path: src.substring(hexo.source_dir.length),
      type: type
    };

    if (timer) clearTimeout(timer);

    hexo.log.log(type, 'Source: %s', data.path);
    queue.push(data);

    timer = setTimeout(timerFn, 100);
  });
};

/**
* Runs processors.
*
* @method process
* @param {String|Array} files
* @param {Function} [callback]
* @async
* @static
*/

var process = exports.process = function(files, callback){
  if (!Array.isArray(files)) files = [files];
  if (typeof callback !== 'function') callback = function(){};

  var sourceDir = hexo.source_dir;

  /**
  * Fired before processing started.
  *
  * @event processBefore
  * @for Hexo
  */

  hexo.emit('processBefore');

  async.each(files, function(item, next){
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
      if (!exist && type !== 'delete') return next();

      var tasks = _getProcessor(path);

      processingFiles[source] = true;

      async.each(tasks, function(task, next){
        var data = new ProcessData(path, type, task.params);

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
        hexo.log.d('Processed: ' + path);
        next();
      });
    });
  }, function(err){
    if (err) return callback(err);

    /**
    * Fired after processing done.
    *
    * @event processAfter
    * @for Hexo
    */

    hexo.emit('processAfter');
    callback();
  });
};

/**
* @class ProcessData
* @param {String} src
* @param {String} type
* @param {Object} params
* @constructor
* @namespace Hexo.source
*/

var ProcessData = function(src, type, params){
  this.path = src;
  this.source = pathFn.join(hexo.source_dir, src);
  this.type = type;
  this.params = params;
};

/**
* Reads the source file.
*
* @method read
* @param {Object} [options]
* @param {Function} callback
* @async
* @chainable
*/

ProcessData.prototype.read = function(options, callback){
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
    hexo.model('Cache').loadCache(this.path, callback);
  } else {
    file.readFile(this.source, callback);
  }

  return this;
};

/**
* Gets the status of source file.
*
* @method stat
* @param {Function} callback
* @async
* @chainable
*/

ProcessData.prototype.stat = function(callback){
  fs.stat(this.source, callback);

  return this;
};