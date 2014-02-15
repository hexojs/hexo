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

var Box = module.exports = function Box(base, options){
  this.base = base;
  this.processors = [];
  this.processingFiles = {};
  this.watcher = null;
  this.isProcessing = false;

  this.options = _.extend({
    presistent: true,
    ignored: /[\/\\]\./,
    ignoreInitial: true
  }, options);
};

Box.prototype.__proto__ = EventEmitter.prototype;

Box.prototype.addProcessor = function(rule, fn){
  this.processors.push({
    pattern: new Pattern(pattern),
    process: fn
  });
};

Box.prototype._dispatch = function(type, path, callback){
  if (typeof callback !== 'function') callback = function(){};

  var self = this;

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
      async.each(files, function(item, next){
        var type, path;

        if (_.isObject(item)){
          path = item.path;
          type = item.type;
        } else {
          path = item;
          type = 'update';
        }

        // Skip the processing file
        if (self.processingFiles[path]) return;

        self.processingFiles[path] = true;
        self._dispatch(type, path, next);
      }, next);
    }
  ], function(err){
    self.isProcessing = false;

    hexo.emit('processAfter', base);
    callback(err);
  });
};

var chokidarEventMap = {
  add: 'create',
  change: 'update',
  unlink: 'delete'
};

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

Box.prototype.unwatch = function(){
  if (!this.watcher) throw new Error('Watcher hasn\'t started yet.');

  this.watcher.stop();
  this.watcher = null;
};