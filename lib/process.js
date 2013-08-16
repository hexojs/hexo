var async = require('async'),
  fs = require('graceful-fs'),
  pathFn = require('path'),
  _ = require('lodash'),
  util = require('./util'),
  file = util.file2,
  HexoError = require('./error');

var extend = hexo.extend,
  processors = extend.processor.list(),
  sourceDir = hexo.source_dir,
  log = hexo.log;

var model = hexo.model,
  Cache = model('Cache');

var processingFiles = [];

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

module.exports = function(files, callback){
  if (!Array.isArray(files)) files = [files];

  hexo.emit('processBefore');

  async.forEach(files, function(item, next){
    if (_.isObject(item)){
      var path = item.path,
        type = item.type;
    } else {
      var path = item,
        type = 'update';
    }

    if (processingFiles.indexOf(path) > -1) return next();

    var source = pathFn.join(sourceDir, path);

    fs.exists(source, function(exist){
      if (!exist) return next();

      var tasks = _getProcessor(path);

      processingFiles.push(path);

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

        processingFiles.splice(processingFiles.indexOf(path), 1);
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

var Data = function(path, type, params){
  this.path = path;
  this.source = pathFn.join(sourceDir, path);
  this.type = type;
  this.params = params;
};

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

Data.prototype.stat = function(callback){
  fs.stat(this.source, callback);
};