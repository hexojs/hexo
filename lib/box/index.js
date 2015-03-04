'use strict';

var pathFn = require('path');
var Promise = require('bluebird');
var _ = require('lodash');
var File = require('./file');
var util = require('hexo-util');
var fs = require('hexo-fs');
var chalk = require('chalk');
var ShasumStream = require('./shasum_stream');

var Pattern = util.Pattern;
var escapeRegExp = util.escapeRegExp;
var join = pathFn.join;
var sep = pathFn.sep;

var defaultPattern = new Pattern(function(){
  return {};
});

function Box(ctx, base, options){
  this.options = _.extend({
    persistent: true,
    ignored: /[\/\\]\./
  }, options);

  if (base.substring(base.length - 1) !== sep){
    base += sep;
  }

  this.context = ctx;
  this.base = base;
  this.processors = [];
  this.processingFiles = {};
  this.watcher = null;
  this.Cache = ctx.model('Cache');

  var _File = this.File = function(data){
    File.call(this, data);
  };

  require('util').inherits(_File, File);

  _File.prototype.box = this;

  _File.prototype.render = function(options, callback){
    if (!callback && typeof options === 'function'){
      callback = options;
      options = {};
    }

    var self = this;

    return this.read().then(function(content){
      return ctx.render.render({
        text: content,
        path: self.source
      }, options);
    }).nodeify(callback);
  };

  _File.prototype.renderSync = function(options){
    return ctx.render.renderSync({
      text: this.readSync(),
      path: this.source
    }, options);
  };
}

function escapeBackslash(path){
  // Replace backslashes on Windows
  return path.replace(/\\/g, '/');
}

Box.prototype.addProcessor = function(pattern, fn){
  if (!fn && typeof pattern === 'function'){
    fn = pattern;
    pattern = defaultPattern;
  }

  if (typeof fn !== 'function') throw new TypeError('fn must be a function');
  if (!(pattern instanceof Pattern)) pattern = new Pattern(pattern);

  this.processors.push({
    pattern: pattern,
    process: fn
  });
};

Box.prototype.process = function(callback){
  var self = this;

  return fs.exists(this.base).then(function(exist){
    if (!exist) return;
    return self._loadFiles();
  }).then(function(files){
    if (!files || !files.length) return;

    return self._process(files).finally(function(){
      files.length = 0;
    });
  }).nodeify(callback);
};

Box.prototype.load = Box.prototype.process;

function listDir(path){
  return fs.listDir(path).catch(function(err){
    // Return an empty array if path does not exist
    if (err.cause.code === 'ENOENT') return [];
    throw err;
  }).map(escapeBackslash);
}

Box.prototype._getExistingFiles = function(){
  var base = this.base;
  var ctx = this.context;
  var relativeBase = escapeBackslash(base.substring(ctx.base_dir.length));
  var regex = new RegExp('^' + escapeRegExp(relativeBase));
  var baseLength = relativeBase.length;

  return this.Cache.find({_id: regex}).map(function(item){
    return item._id.substring(baseLength);
  });
};

Box.prototype._loadFiles = function(){
  var base = this.base;
  var self = this;
  var existed = this._getExistingFiles();

  return listDir(base).then(function(files){
    var result = [];

    // created = files - existed
    var created = _.difference(files, existed);
    var i, len, item;

    for (i = 0, len = created.length; i < len; i++){
      item = created[i];

      result.push({
        path: item,
        type: 'create'
      });
    }

    for (i = 0, len = existed.length; i < len; i++){
      item = existed[i];

      if (~files.indexOf(item)){
        result.push({
          path: item,
          type: 'update'
        });
      } else {
        result.push({
          path: item,
          type: 'delete'
        });
      }
    }

    return result;
  }).map(function(item){
    existed.length = 0;

    switch (item.type){
      case 'create':
      case 'update':
        return self._handleUpdatedFile(item.path);

      case 'delete':
        return self._handleDeletedFile(item.path);
    }
  });
};

function getShasum(path){
  return new Promise(function(resolve, reject){
    var src = fs.createReadStream(path);
    var stream = new ShasumStream();

    src.pipe(stream)
      .on('error', reject)
      .on('finish', function(){
        resolve(stream.getShasum());
      });
  });
}

Box.prototype._handleUpdatedFile = function(path){
  var Cache = this.Cache;
  var ctx = this.context;
  var fullPath = join(this.base, path);

  return Promise.all([
    getShasum(fullPath),
    fs.stat(fullPath)
  ]).spread(function(shasum, stats){
    var id = escapeBackslash(fullPath.substring(ctx.base_dir.length));
    var cache = Cache.findById(id);

    if (!cache){
      ctx.log.debug('Added: %s', chalk.magenta(id));

      return Cache.insert({
        _id: id,
        shasum: shasum,
        modified: stats.mtime
      }).thenReturn({
        type: 'create',
        path: path
      });
    } else if (cache.shasum === shasum){
      ctx.log.debug('Unchanged: %s', chalk.magenta(id));

      return {
        type: 'skip',
        path: path
      };
    } else {
      ctx.log.debug('Updated: %s', chalk.magenta(id));

      cache.shasum = shasum;
      cache.modified = stats.mtime;

      return cache.save().thenReturn({
        type: 'update',
        path: path
      });
    }
  });
};

Box.prototype._handleDeletedFile = function(path){
  var fullPath = join(this.base, path);
  var ctx = this.context;
  var Cache = this.Cache;

  return new Promise(function(resolve, reject){
    var id = escapeBackslash(fullPath.substring(ctx.base_dir.length));
    var cache = Cache.findById(id);
    if (!cache) return resolve();

    ctx.log.debug('Deleted: %s', chalk.magenta(id));
    cache.remove().then(resolve, reject);
  }).thenReturn({
    type: 'delete',
    path: path
  });
};

Box.prototype._process = function(files){
  var self = this;
  var ctx = this.context;
  var base = this.base;

  ctx.emit('processBefore', base);

  return Promise.map(files, function(item){
    return self._dispatch(item);
  }, {concurrency: 1})
  // Set concurrency to 1 to solve sync problem.
  // This problem must be solved in database someday.
  .then(function(){
    ctx.emit('processAfter', base);
  });
};

Box.prototype._dispatch = function(item){
  var path = item.path;
  var File = this.File;
  var self = this;
  var ctx = this.context;
  var base = this.base;

  // Skip processing files
  if (this.processingFiles[path]) return;

  // Lock the file
  this.processingFiles[path] = true;

  // Use Promise.reduce to calculate the number of processors executed
  return Promise.reduce(this.processors, function(count, processor){
    // Check whether the path match with the pattern of the processor
    var params = processor.pattern.match(path);
    if (!params) return count;

    var file = new File({
      source: join(base, path),
      path: path,
      type: item.type,
      params: params
    });

    return Promise.method(processor.process).call(ctx, file).thenReturn(count + 1);
  }, 0).then(function(count){
    if (count){
      ctx.log.debug('Processed: %s', chalk.magenta(path));
    }
  }, function(err){
    ctx.log.error({err: err}, 'Process failed: %s', chalk.magenta(path));
  }).finally(function(){
    // Remember to unlock the file
    self.processingFiles[path] = false;
  });
};

Box.prototype.watch = function(callback){
  var base = this.base;
  var baseLength = base.length;
  var self = this;
  var queue = [];
  var timer;

  function getPath(path){
    return escapeBackslash(path.substring(baseLength));
  }

  function dispatch(data){
    // Stop the timer
    if (timer) clearTimeout(timer);

    // Add data to the queue
    queue.push(data);

    // Start the timer
    setTimeout(generate, 100);
  }

  function generate(){
    var tasks = queue;
    queue = [];

    self._process(tasks).finally(function(){
      tasks.length = 0;
    });
  }

  return new Promise(function(resolve, reject){
    if (self.isWatching()) return reject(new Error('Watcher has already started.'));
    self.process().then(resolve, reject);
  }).then(function(){
    return fs.watch(base, self.options);
  }).then(function(watcher){
    self.watcher = watcher;

    watcher.on('add', function(path){
      self._handleUpdatedFile(getPath(path)).then(dispatch);
    }).on('change', function(path){
      self._handleUpdatedFile(getPath(path)).then(dispatch);
    }).on('unlink', function(path){
      self._handleDeletedFile(getPath(path)).then(dispatch);
    }).on('addDir', function(path){
      fs.listDir(path).map(function(item){
        var filePath = getPath(pathFn.join(path, item));
        return self._handleUpdatedFile(filePath).then(dispatch);
      });
    });

    return watcher;
  }).nodeify(callback);
};

Box.prototype.unwatch = function(){
  if (!this.isWatching()) throw new Error('Watcher hasn\'t started yet.');

  this.watcher.close();
  this.watcher = null;
};

Box.prototype.isWatching = function(){
  return Boolean(this.watcher);
};

module.exports = Box;