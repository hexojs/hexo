var pathFn = require('path');
var Promise = require('bluebird');
var _ = require('lodash');
var File = require('./file');
var util = require('hexo-util');
var fs = require('hexo-fs');
var prettyHrtime = require('pretty-hrtime');
var crypto = require('crypto');
var chalk = require('chalk');

var Pattern = util.Pattern;
var escapeRegExp = util.escapeRegExp;
var join = pathFn.join;
var sep = pathFn.sep;

var patternNoob = new Pattern(function(){
  return {};
});

function Box(ctx, base, options){
  this.options = _.extend({
    persistent: true,
    ignored: /[\/\\]\./,
    ignoreInitial: true
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
  // Maybe it will be better to use WeakMap to avoid memory leak?
  // But it's still on the road...
  this.bufferStore = {};
  this.statStore = {};

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

var escapeBackslash = sep !== '/' ? escapeBackslashWindows : escapeBackslashDefault;

function escapeBackslashDefault(path){
  return path;
}

function escapeBackslashWindows(path){
  // Replace backslashes on Windows
  return path.replace(/\\/g, '/');
}

Box.prototype.addProcessor = function(pattern, fn){
  if (!fn && typeof pattern === 'function'){
    fn = pattern;
    pattern = patternNoob;
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
    if (files) return self._process(files);
  }).nodeify(callback);
};

Box.prototype.load = Box.prototype.process;

function listDir(path){
  return fs.listDir(path).catch(function(err){
    // Return an empty array if path does not exist
    if (err.cause.code !== 'ENOENT') throw err;
    return [];
  }).map(escapeBackslash);
}

Box.prototype._loadFiles = function(){
  var base = this.base;
  var Cache = this.Cache;
  var self = this;
  var ctx = this.context;
  var relativeBase = escapeBackslash(base.substring(ctx.base_dir.length));
  var regex = new RegExp('^' + escapeRegExp(relativeBase));
  var baseLength = relativeBase.length;

  // Find existing cache data
  var existed = Cache.find({_id: regex}).map(function(item){
    return item._id.substring(baseLength);
  });

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
    var hash = crypto.createHash('sha1');
    var buffers = [];
    var length = 0;
    var stream = fs.createReadStream(path);

    stream.on('readable', function(){
      var chunk;

      while ((chunk = stream.read()) !== null){
        length += chunk.length;
        buffers.push(chunk);
        hash.update(chunk);
      }
    }).on('end', function(){
      resolve({
        content: Buffer.concat(buffers, length),
        shasum: hash.digest('hex')
      });
    }).on('error', reject);
  });
}

Box.prototype._handleUpdatedFile = function(path){
  var Cache = this.Cache;
  var ctx = this.context;
  var fullPath = join(this.base, path);
  var self = this;

  return Promise.all([
    getShasum(fullPath),
    fs.stat(fullPath)
  ]).spread(function(data, stats){
    var id = escapeBackslash(fullPath.substring(ctx.base_dir.length));
    var cache = Cache.findById(id);
    var shasum = data.shasum;

    self.bufferStore[path] = data.content;
    self.statStore[path] = stats;

    if (!cache){
      ctx.log.info('Added: %s', chalk.magenta(id));

      return Cache.insert({
        _id: id,
        shasum: shasum,
        modified: stats.mtime
      }).thenReturn({
        type: 'create',
        path: path
      });
    } else if (cache.shasum === shasum){
      ctx.log.info('Unchanged: %s', chalk.magenta(id));

      return {
        type: 'skip',
        path: path
      };
    } else {
      ctx.log.info('Updated: %s', chalk.magenta(id));

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

  this.bufferStore[path] = null;
  this.statStore[path] = null;

  return new Promise(function(resolve, reject){
    var id = escapeBackslash(fullPath.substring(ctx.base_dir.length));
    var cache = Cache.findById(id);
    if (!cache) return resolve();

    ctx.log.debug('Deleted: %s', chalk.magenta(id));
    return cache.remove().then(resolve, reject);
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
  }).then(function(){
    ctx.emit('processAfter', base);
  });
};

Box.prototype._dispatch = function(item){
  var path = item.path;
  var File = this.File;
  var self = this;
  var ctx = this.context;
  var base = this.base;
  var start = process.hrtime();

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
      params: params,
      content: self.bufferStore[path],
      stats: self.statStore[path]
    });

    return Promise.method(processor.process).call(ctx, file).thenReturn(count + 1);
  }, 0).then(function(count){
    if (count){
      var interval = prettyHrtime(process.hrtime(start));
      ctx.log.debug('Processed in %s: %s', chalk.cyan(interval), chalk.magenta(path));
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