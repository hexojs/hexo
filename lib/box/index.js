var pathFn = require('path');
var Promise = require('bluebird');
var _ = require('lodash');
var chokidar = require('chokidar');
var File = require('./file');
var Pattern = require('./pattern');
var util = require('../util');
var fs = util.fs;

require('colors');

function Box(context, base, options){
  this.context = context;
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

  var _File = this.File = function(data){
    File.call(this, data);
  };

  util.inherits(_File, File);

  _File.prototype.box = this;
  _File.prototype._context = context;
}

Box.prototype.addProcessor = function(pattern, fn){
  if (!fn && typeof pattern === 'function'){
    fn = pattern;
    pattern = new Pattern(/(.*)/);
  }

  if (typeof fn !== 'function') throw new TypeError('fn must be a function');
  if (!(pattern instanceof Pattern)) pattern = new Pattern(pattern);

  this.processors.push({
    pattern: pattern,
    process: fn
  });
};

Box.prototype.process = function(files, callback){
  var self = this;
  var base = this.base;
  var ctx = this.context;

  return new Promise(function(resolve, reject){
    if (self.isProcessing) return reject(new Error('Box is processing!'));

    self.isProcessing = true;
    ctx.emit('processBefore', base);

    if (files){
      return Array.isArray(files) ? files : [files];
    } else {
      return self._loadFileList();
    }
  }).map(function(item){
    if (typeof item === 'object'){
      return self._dispatch(item);
    } else {
      return self._dispatch({
        path: item,
        type: 'update'
      });
    }
  }).finally(function(){
    self.isProcessing = false;
  }).nodeify(callback);
};

Box.prototype.load = Box.prototype.process;

Box.prototype._dispatch = function(item){
  var path = item.path.replace(/\\/g, '/');
  var start = Date.now();
  var base = this.base;
  var self = this;
  var ctx = this.context;
  var log = ctx.log;
  var executed = false;

  if (this.processingFiles[path]) return;

  this.processingFiles[path] = true;

  return Promise.map(this.processors, function(processor){
    var params = processor.pattern.match(item);
    if (!params) return;

    var file = new self.File({
      src: pathFn.join(base, item),
      path: path,
      params: params,
      type: item.type
    });

    executed = true;

    return processor.process.call(self, file);
  }).then(function(){
    if (!executed) return;

    log.debug('Processed: %s in ' + '%dms'.cyan, path.magenta, Date.now() - start);
  }, function(err){
    log.error('Process failed: %s', path.magenta);
    throw err;
  }).finally(function(){
    self.processingFiles = false;
  });
};

Box.prototype._loadFileList = function(){
  return fs.listDir(this.base);
};

var chokidarEventMap = {
  add: 'create',
  change: 'update',
  unlink: 'delete'
};

Box.prototype.watch = function(){
  if (this.watcher) throw new Error('Watcher has already started.');

  var base = this.base;
  var baseLength = base.length;
  var self = this;

  this.watcher = chokidar.watch(this.base, this.options)
    .on('all', function(event, src){
      var type = chokidarEventMap[event];
      var path = src.substring(baseLength);

      if (!type) return;

      self.process({type: type, path: path});
    });
};

Box.prototype.unwatch = function(){
  if (!this.watcher) throw new Error('Watcher hasn\'t started yet.');

  this.watcher.stop();
  this.watcher = null;
};

Box.File = File;
Box.Pattern = Box.prototype.Pattern = Pattern;

module.exports = Box;