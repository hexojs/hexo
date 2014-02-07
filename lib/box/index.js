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

Box.prototype.process = function(callback){
  if (this.isProcessing) return callback(new Error('Box is processing!'));

  var self = this;
  this.isProcessing = true;

  hexo.emit('processBefore', this.base);

  file.list(this.base, function(err, files){
    if (err){
      self.isProcessing = false;
      return callback(err);
    }

    async.each(files, function(file, next){
      if (self.processingFiles[file]) return;

      self.processingFiles[file] = true;
      self._dispatch('update', file, next);
    }, function(err){
      self.isProcessing = false;

      hexo.emit('processAfter', self.base);
      callback(err);
    });
  });
};

var chokidarEventMap = {
  add: 'create',
  change: 'update',
  unlink: 'remove'
};

Box.prototype.watch = function(){
  if (this.watcher) throw new Error('Watcher has already started.');

  var self = this;

  this.watcher = chokidar.watch(this.base, this.options)
    .on('all', function(event, src){
      var type = chokidarEventMap[event],
        path = src.substring(0, self.base.length);

      self._dispatch(type, path);
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