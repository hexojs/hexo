'use strict';

var pathFn = require('path');
var Promise = require('bluebird');
var _ = require('lodash');
var File = require('./file');
var util = require('hexo-util');
var fs = require('hexo-fs');
var chalk = require('chalk');
var EventEmitter = require('events').EventEmitter;
var minimatch = require('minimatch');

var Pattern = util.Pattern;
var join = pathFn.join;
var sep = pathFn.sep;

var defaultPattern = new Pattern(function() {
  return {};
});

function Box(ctx, base, options) {
  EventEmitter.call(this);

  this.options = _.assign({
    persistent: true
  }, options);

  if (base.substring(base.length - 1) !== sep) {
    base += sep;
  }

  this.context = ctx;
  this.base = base;
  this.processors = [];
  this._processingFiles = {};
  this.watcher = null;
  this.Cache = ctx.model('Cache');
  this.File = this._createFileClass();
  this.ignore = ctx.config.ignore;

  if (!Array.isArray(this.ignore)) {
    this.ignore = [this.ignore];
  }
}

require('util').inherits(Box, EventEmitter);

function escapeBackslash(path) {
  // Replace backslashes on Windows
  return path.replace(/\\/g, '/');
}

function getHash(path) {
  return new Promise(function(resolve, reject) {
    var src = fs.createReadStream(path);
    var hasher = new util.HashStream();

    src.pipe(hasher)
      .on('finish', function() {
        resolve(hasher.read().toString('hex'));
      })
      .on('error', reject);
  });
}

Box.prototype._createFileClass = function() {
  var ctx = this.context;

  var _File = function(data) {
    File.call(this, data);
  };

  require('util').inherits(_File, File);

  _File.prototype.box = this;

  _File.prototype.render = function(options, callback) {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = {};
    }

    return ctx.render.render({
      path: this.source
    }, options).asCallback(callback);
  };

  _File.prototype.renderSync = function(options) {
    return ctx.render.renderSync({
      path: this.source
    }, options);
  };

  return _File;
};

Box.prototype.addProcessor = function(pattern, fn) {
  if (!fn && typeof pattern === 'function') {
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

Box.prototype._readDir = function(base, fn, prefix) {
  prefix = prefix || '';

  var self = this;
  var ignore = self.ignore;

  if (base && ignore && ignore.length) {
    for (var i = 0, len = ignore.length; i < len; i++) {
      if (minimatch(base, ignore[i])) {
        return Promise.resolve('Ignoring dir.');
      }
    }
  }

  return fs.readdir(base).map(function(path) {
    return fs.stat(join(base, path)).then(function(stats) {
      if (stats.isDirectory()) {
        return self._readDir(join(base, path), fn, prefix + path + '/');
      }

      return self._checkFileStatus(prefix + path).then(function(file) {
        return fn(file).thenReturn(file);
      });
    });
  }).catch(function(err) {
    if (err.cause && err.cause.code === 'ENOENT') return;
    throw err;
  }).reduce(function(files, item) {
    return files.concat(item);
  }, []);
};

Box.prototype._checkFileStatus = function(path) {
  var Cache = this.Cache;
  var src = join(this.base, path);
  var ctx = this.context;

  return Cache.compareFile(
    escapeBackslash(src.substring(ctx.base_dir.length)),
    function() {
      return getHash(src);
    },

    function() {
      return fs.stat(src);
    }
  ).then(function(result) {
    return {
      type: result.type,
      path: path
    };
  });
};

Box.prototype.process = function(callback) {
  var self = this;
  var base = this.base;
  var Cache = this.Cache;
  var ctx = this.context;

  return fs.stat(base).then(function(stats) {
    if (!stats.isDirectory()) return;

    // Check existing files in cache
    var relativeBase = escapeBackslash(base.substring(ctx.base_dir.length));
    var cacheFiles = Cache.filter(function(item) {
      return item._id.substring(0, relativeBase.length) === relativeBase;
    }).map(function(item) {
      return item._id.substring(relativeBase.length);
    });

    // Read files from directory
    return self._readDir(base, function(file) {
      return self._processFile(file.type, file.path);
    }).map(function(file) {
      return file.path;
    }).then(function(files) {
      // Handle deleted files
      return Promise.filter(cacheFiles, function(path) {
        return !~files.indexOf(path);
      }).map(function(path) {
        return self._processFile(File.TYPE_DELETE, path);
      });
    });
  }).catch(function(err) {
    if (err.cause && err.cause.code !== 'ENOENT') throw err;
  }).asCallback(callback);
};

Box.prototype.load = Box.prototype.process;

Box.prototype._processFile = function(type, path) {
  if (this._processingFiles[path]) {
    return Promise.resolve();
  }

  this._processingFiles[path] = true;

  var File = this.File;
  var base = this.base;
  var ctx = this.context;
  var self = this;

  this.emit('processBefore', {
    type: type,
    path: path
  });

  return Promise.reduce(this.processors, function(count, processor) {
    var params = processor.pattern.match(path);
    if (!params) return count;

    var file = new File({
      source: join(base, path),
      path: path,
      params: params,
      type: type
    });

    return Promise.method(processor.process).call(ctx, file)
      .thenReturn(count + 1);
  }, 0).then(function(count) {
    if (count) {
      ctx.log.debug('Processed: %s', chalk.magenta(path));
    }

    self.emit('processAfter', {
      type: type,
      path: path
    });
  }).catch(function(err) {
    ctx.log.error({err: err}, 'Process failed: %s', chalk.magenta(path));
  }).finally(function() {
    self._processingFiles[path] = false;
  }).thenReturn(path);
};

Box.prototype.watch = function(callback) {
  if (this.isWatching()) {
    return Promise.reject(new Error('Watcher has already started.')).asCallback(callback);
  }

  var base = this.base;
  var self = this;

  function getPath(path) {
    return escapeBackslash(path.substring(base.length));
  }

  return this.process().then(function() {
    return fs.watch(base, self.options);
  }).then(function(watcher) {
    self.watcher = watcher;

    watcher.on('add', function(path) {
      self._processFile(File.TYPE_CREATE, getPath(path));
    });

    watcher.on('change', function(path) {
      self._processFile(File.TYPE_UPDATE, getPath(path));
    });

    watcher.on('unlink', function(path) {
      self._processFile(File.TYPE_DELETE, getPath(path));
    });

    watcher.on('addDir', function(path) {
      var prefix = getPath(path);
      if (prefix) prefix += '/';

      self._readDir(path, function(file) {
        return self._processFile(file.type, file.path);
      }, prefix);
    });
  }).asCallback(callback);
};

Box.prototype.unwatch = function() {
  if (!this.isWatching()) return;

  this.watcher.close();
  this.watcher = null;
};

Box.prototype.isWatching = function() {
  return Boolean(this.watcher);
};

module.exports = Box;
