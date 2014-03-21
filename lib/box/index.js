var fs = require('graceful-fs'),
  pathFn = require('path'),
  async = require('async'),
  _ = require('lodash'),
  chokidar = require('chokidar'),
  EventEmitter = require('events').EventEmitter,
  Pattern = require('./pattern'),
  HexoError = require('../error'),
  util = require('../util'),
  file = util.file2,
  File = require('./file');

/**
* This module is used to manage files and processors.
*
* @class Box
* @module hexo
* @constructor
* @param {String} base
* @param {Object} [options] See [chokidar](https://github.com/paulmillr/chokidar)
*   @param {Boolean} [options.presistent=true]
*   @param {RegExp} [options.ignored=/[\/\\]\./]
*   @param {Boolean} [options.ignoreInitial=true]
* @extends EventEmitter
*/

var Box = module.exports = function Box(base, options){
  /**
  * Base path.
  *
  * @property base
  * @type {String}
  */
  this.base = base;

  /**
  * Processor collection.
  *
  * @property processors
  * @type {Array}
  */
  this.processors = [];

  /**
  * Processing files.
  *
  * @property processingFiles
  * @type {Object}
  * @private
  */
  this.processingFiles = {};

  /**
  * A instance of watcher.
  *
  * @property watcher
  * @type {FSWatcher}
  */
  this.watcher = null;

  /**
  * Indicates if the box is processing.
  *
  * @property isProcessing
  * @type {Boolean}
  * @private
  */
  this.isProcessing = false;

  /**
  * @property options
  * @type Object
  */
  this.options = _.extend({
    presistent: true,
    ignored: /[\/\\]\./,
    ignoreInitial: true
  }, options);
};

Box.prototype.__proto__ = EventEmitter.prototype;

/**
* Adds a processor to the box.
*
* @method addProcessor
* @param {RegExp|String} pattern The path pattern of the processor. See {% crosslink Box.Pattern %} for more info.
* @param {Function} fn The processor function.
*/
Box.prototype.addProcessor = function(pattern, fn){
  this.processors.push({
    pattern: new Pattern(pattern),
    process: fn
  });
};

/**
* Dispatches files to processors.
*
* @method _dispatch
* @param {String} type Available types: create, update, delete
* @param {String} path File path
* @param {Function} [callback]
* @private
* @async
*/
Box.prototype._dispatch = function(type, path, callback){
  if (typeof callback !== 'function') callback = function(){};

  var self = this;

  // Replace backslashes on Windows
  path = path.replace(/\\/g, '/');

  // Skip processing files
  if (this.processingFiles[path]) return callback();

  this.processingFiles[path] = true;

  async.each(this.processors, function(processor, next){
    if (!processor.pattern.test(path)) return next();

    var params = processor.pattern.match(path),
      src = pathFn.join(self.base, path);

    processor.process(new File(self, src, path, type, params), function(err){
      if (err){
        if (err instanceof HexoError){
          return next(err);
        } else {
          return next(HexoError.wrap(err, 'Process failed: ' + path));
        }
      }

      next();
    });
  }, function(err){
    if (err) return callback(err);

    self.processingFiles[path] = false;
    hexo.log.d('Processed: %s', path);
    callback();
  });
};

/**
* Loads all files and runs processors.
*
* @method process
* @param {Array|String} [files] Files to be processed
* @param {Function} [callback]
* @async
*/
Box.prototype.process = function(files, callback){
  if (!callback){
    if (typeof files === 'function'){
      callback = files;
      files = null;
    } else {
      callback = function(){};
    }
  }

  if (this.isProcessing) return callback(new Error('Box is processing!'));

  var self = this,
    base = this.base;

  this.isProcessing = true;

  /**
  * Fired before the process started.
  *
  * @event processBefore
  * @param {String} base The base path of the box
  * @for Hexo
  */
  hexo.emit('processBefore', base);

  async.waterfall([
    function(next){
      if (files){
        if (!Array.isArray(files)) files = [files];

        next(null, files);
      } else {
        file.list(base, next);
      }
    },
    function(files, next){
      async.eachSeries(files, function(item, next){
        var type, path;

        if (_.isObject(item)){
          path = item.path;
          type = item.type;
        } else {
          path = item;
          type = 'update';
        }

        self._dispatch(type, path, next);
      }, next);
    }
  ], function(err){
    self.isProcessing = false;

    /**
    * Fired after the process has been done.
    *
    * @event processAfter
    * @param {String} base The base path of the box
    * @for Hexo
    */
    hexo.emit('processAfter', base);
    callback(err);
  });
};

var chokidarEventMap = {
  add: 'create',
  change: 'update',
  unlink: 'delete'
};

/**
* Starts watching.
*
* @method watch
* @for Box
*/

Box.prototype.watch = function(){
  if (this.watcher) throw new Error('Watcher has already started.');

  var self = this,
    queue = [],
    isRunning = false,
    timer;

  var timerFn = function(){
    if (queue.length && !isRunning){
      isRunning = true;

      self.process(queue, function(err){
        isRunning = false;
        queue.length = 0;

        if (err) return hexo.log.e(err);
      });
    }
  };

  this.watcher = chokidar.watch(this.base, this.options)
    .on('all', function(event, src){
      var type = chokidarEventMap[event],
        path = src.substring(self.base.length);

      if (!type) return;
      if (timer) clearTimeout(timer);

      queue.push({
        type: type,
        path: path
      });

      timer = setTimeout(timerFn, 100);
      hexo.log.log(type, src);
    })
    .on('error', function(err){
      self.emit('error', err);
    });
};

/**
* Stops watching.
*
* @method unwatch
*/
Box.prototype.unwatch = function(){
  if (!this.watcher) throw new Error('Watcher hasn\'t started yet.');

  this.watcher.stop();
  this.watcher = null;
};