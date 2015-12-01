'use strict';

var pathFn = require('path');
var Promise = require('bluebird');
var _ = require('lodash');
var File = require('./file');
var util = require('hexo-util');
var fs = require('hexo-fs');
var chalk = require('chalk');
var hash = require('../hash');

var Pattern = util.Pattern;
var join = pathFn.join;
var sep = pathFn.sep;

var defaultPattern = new Pattern(function() {
  return {};
});

function Box(ctx, base, options) {
  this.options = _.extend({
    persistent: true
  }, options);

  if (base.substring(base.length - 1) !== sep) {
    base += sep;
  }

  this.context = ctx;
  this.base = base;
  this.processors = [];
  this.processingFiles = {};
  this.watcher = null;
  var Cache = this.Cache = ctx.model('Cache');

  var _File = this.File = function(data) {
    File.call(this, data);

    this._typeSolved = data.type === File.TYPE_DELETE;
  };

  require('util').inherits(_File, File);

  _File.prototype.box = this;

  _File.prototype.render = function(options, callback) {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = {};
    }

    var self = this;

    return this.read().then(function(content) {
      return ctx.render.render({
        text: content,
        path: self.source
      }, options);
    }).asCallback(callback);
  };

  _File.prototype.renderSync = function(options) {
    return ctx.render.renderSync({
      text: this.readSync(),
      path: this.source
    }, options);
  };

  _File.prototype.changed = function(callback) {
    if (this._typeSolved) {
      return Promise.resolve(this.type !== File.TYPE_SKIP).asCallback(callback);
    }

    var self = this;

    // TODO: Share file type between processors
    return Cache.compareFile(
      this.source.substring(ctx.base_dir.length),
      function() {
        return getHash(self.source);
      },

      function() {
        return self.stat();
      }
    ).then(function(result) {
      self.type = result.type;
      self._typeSolved = true;

      return result.type !== File.TYPE_SKIP;
    }).asCallback(callback);
  };
}

function escapeBackslash(path) {
  // Replace backslashes on Windows
  return path.replace(/\\/g, '/');
}

function getHash(path) {
  return new Promise(function(resolve, reject) {
    var src = fs.createReadStream(path);
    var hasher = hash.stream();

    src.pipe(hasher)
      .on('finish', function() {
        resolve(hasher.read());
      })
      .on('error', reject);
  });
}

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

function readDir(base, fn, prefix) {
  prefix = prefix || '';

  return fs.readdir(base).map(function(path) {
    return fs.stat(join(base, path)).then(function(stats) {
      if (stats.isDirectory()) {
        return readDir(join(base, path), fn, prefix + path + '/');
      }

      var relativePath = prefix + path;
      return fn(relativePath).thenReturn(relativePath);
    });
  }).catch(function(err) {
    if (err.cause && err.cause.code === 'ENOENT') return;
    throw err;
  }).reduce(function(files, item) {
    return files.concat(item);
  }, []);
}

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
      return item._id;
    });

    // Read files from directory
    return readDir(base, function(path) {
      // If the files is not in the cache, means it's new
      var type = ~cacheFiles.indexOf(path) ? File.TYPE_UPDATE : File.TYPE_CREATE;
      return self._processFile(type, path);
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
  if (this.processingFiles[path]) {
    return Promise.resolve();
  }

  this.processingFiles[path] = true;

  var File = this.File;
  var base = this.base;
  var ctx = this.context;
  var self = this;

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
  }).catch(function(err) {
    ctx.log.error({err: err}, 'Process failed: %s', chalk.magenta(path));
  }).finally(function() {
    self.processingFiles[path] = false;
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
      readDir(path, function(path) {
        return self._processFile(File.TYPE_CREATE, path);
      }, getPath(path) + '/');
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
