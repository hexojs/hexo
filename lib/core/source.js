var async = require('async'),
  fs = require('graceful-fs'),
  pathFn = require('path'),
  _ = require('lodash'),
  chokidar = require('chokidar'),
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

var ProcessData = function(src, type, params){
  this.path = src;
  this.source = pathFn.join(hexo.source_dir, src);
  this.type = type;
  this.params = params;
};

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
};

ProcessData.prototype.stat = function(callback){
  fs.stat(this.source, callback);
};

var process = exports.process = function(files, callback){
  if (!Array.isArray(files)) files = [files];
  if (typeof callback !== 'function') callback = function(){};

  var sourceDir = hexo.source_dir;

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

    hexo.emit('processAfter');
    callback();
  });
};

exports.load = function(callback){
  if (typeof callback !== 'function') callback = function(){};
  if (isRunning || isReady) return callback();

  file.list(hexo.source_dir, {ignorePattern: rTmpFile}, function(err, files){
    if (err) return callback(HexoError.wrap(err, 'Source load failed'));

    process(files, function(err){
      isRunning = false;

      if (err) return callback(err);

      isReady = true;

      callback();
    });
  });
};

var _parseType = function(type){
  switch (type){
    case 'add':
      return 'create';

    case 'change':
      return 'update';

    case 'unlink':
      return 'delete';

    default:
      return type;
  }
};

exports.watch = function(callback){
  if (typeof callback !== 'function') callback = function(){};
  if (!isReady) return;

  var watcher = chokidar.watch(hexo.source_dir, {
    ignored: rTmpFile,
    persistent: true,
    ignoreInitial: true
  });

  var queue = [],
    timer;

  var timerFn = function(){
    if (queue.length){
      process(queue, callback);
      queue.length = 0;
    }
  };

  watcher.on('all', function(type, src, stats){
    if (type === 'error') return hexo.log.e('Source watch error: ' + src);

    var data = {
      path: src.substring(hexo.source_dir.length),
      type: _parseType(type)
    };

    if (timer) clearTimeout(timer);

    hexo.log.log(data.type, 'Source: %s', data.path);
    queue.push(data);

    timer = setTimeout(timerFn, 100);
  });
};