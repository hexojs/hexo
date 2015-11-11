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
var escapeRegExp = util.escapeRegExp;
var join = pathFn.join;
var sep = pathFn.sep;

var defaultPattern = new Pattern(function() {
  return {};
});

function Box(ctx, base, options) {
  this.options = _.extend({
    persistent: true,
    ignored: /[\/\\]\./
  }, options);

  if (base.substring(base.length - 1) !== sep) {
    base += sep;
  }

  this.context = ctx;
  this.base = base;
  this.processors = [];
  this.processingFiles = {};
  this.watcher = null;
  this.Cache = ctx.model('Cache');

  var _File = this.File = function(data) {
    File.call(this, data);
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
}

function escapeBackslash(path) {
  // Replace backslashes on Windows
  return path.replace(/\\/g, '/');
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

Box.prototype.process = function(callback) {
  var self = this;

  return fs.exists(this.base).then(function(exist) {
    if (!exist) return;
    return self._loadFiles();
  }).then(function(files) {
    if (files && files.length) {
      return self._process(files);
    }
  }).asCallback(callback);
};

Box.prototype.load = Box.prototype.process;

function listDir(path) {
  return fs.listDir(path).catch(function(err) {
    // Return an empty array if path does not exist
    if (err.cause && err.cause.code === 'ENOENT') return [];
    throw err;
  }).map(escapeBackslash);
}

Box.prototype._getExistingFiles = function() {
  var base = this.base;
  var ctx = this.context;
  var relativeBase = escapeBackslash(base.substring(ctx.base_dir.length));
  var regex = new RegExp('^' + escapeRegExp(relativeBase));
  var baseLength = relativeBase.length;

  return this.Cache.find({_id: regex}).map(function(item) {
    return item._id.substring(baseLength);
  });
};

Box.prototype._loadFiles = function() {
  var base = this.base;
  var self = this;
  var existed = this._getExistingFiles();

  return listDir(base).then(function(files) {
    var result = [];

    // created = files - existed
    var created = _.difference(files, existed);
    var i, len, item;

    for (i = 0, len = created.length; i < len; i++) {
      item = created[i];

      result.push({
        path: item,
        type: File.TYPE_CREATE
      });
    }

    for (i = 0, len = existed.length; i < len; i++) {
      item = existed[i];

      if (~files.indexOf(item)) {
        result.push({
          path: item,
          type: File.TYPE_UPDATE
        });
      } else {
        result.push({
          path: item,
          type: File.TYPE_DELETE
        });
      }
    }

    return result;
  }).map(function(item) {
    switch (item.type){
      case File.TYPE_CREATE:
      case File.TYPE_UPDATE:
        return self._handleUpdatedFile(item.path);

      case File.TYPE_DELETE:
        return self._handleDeletedFile(item.path);
    }
  });
};

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

Box.prototype._handleUpdatedFile = function(path) {
  // Skip the file if it's processing
  if (this.processingFiles[path]) return Promise.resolve();

  this.processingFiles[path] = true;

  var Cache = this.Cache;
  var ctx = this.context;
  var fullPath = join(this.base, path);
  var id = escapeBackslash(fullPath.substring(ctx.base_dir.length));
  var self = this;

  return Cache.compareFile(
    id,
    function() {
      return getHash(fullPath);
    },

    function() {
      return fs.stat(fullPath);
    }
  ).then(function(result) {
    result.path = path;
    return result;
  }).finally(function() {
    // Unlock the file
    self.processingFiles[path] = false;
  });
};

Box.prototype._handleDeletedFile = function(path) {
  // Skip the file if it's processing
  if (this.processingFiles[path]) return Promise.resolve();

  this.processingFiles[path] = true;

  var fullPath = join(this.base, path);
  var ctx = this.context;
  var Cache = this.Cache;
  var id = escapeBackslash(fullPath.substring(ctx.base_dir.length));
  var cache = Cache.findById(id);
  var result = {
    type: File.TYPE_DELETE,
    path: path
  };
  var self = this;

  function unlock() {
    self.processingFiles[path] = false;
  }

  if (!cache) {
    return Promise.resolve(result).finally(unlock);
  }

  return cache.remove().thenReturn({
    type: File.TYPE_DELETE,
    path: path
  }).finally(unlock);
};

Box.prototype._process = function(files) {
  var self = this;
  var ctx = this.context;
  var base = this.base;

  files = _.uniq(files, function(item) {
    return item.path;
  });

  ctx.emit('processBefore', base);

  return Promise.map(files, function(item) {
    return self._dispatch(item);
  })
  .then(function() {
    ctx.emit('processAfter', base);
  });
};

Box.prototype._dispatch = function(item) {
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
  return Promise.reduce(this.processors, function(count, processor) {
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
  }, 0).then(function(count) {
    if (count) {
      ctx.log.debug('Processed: %s', chalk.magenta(path));
    }
  }).catch(function(err) {
    ctx.log.error({err: err}, 'Process failed: %s', chalk.magenta(path));
  }).then(function() {
    // Remember to unlock the file
    self.processingFiles[path] = false;
  });
};

Box.prototype.watch = function(callback) {
  if (this.isWatching()) {
    return Promise.reject(new Error('Watcher has already started.'));
  }

  var base = this.base;
  var baseLength = base.length;
  var self = this;
  var queue = [];
  var timer;

  function getPath(path) {
    return escapeBackslash(path.substring(baseLength));
  }

  function dispatch(data) {
    // Stop the timer
    if (timer) clearTimeout(timer);

    // Add data to the queue
    if (data) queue.push(data);

    // Start the timer
    setTimeout(generate, 100);
  }

  function generate() {
    var tasks = queue;
    queue = [];

    self._process(tasks).finally(function() {
      tasks.length = 0;
    });
  }

  return this.process().then(function() {
    return fs.watch(base, self.options);
  }).then(function(watcher) {
    self.watcher = watcher;

    watcher.on('add', function(path) {
      self._handleUpdatedFile(getPath(path)).then(dispatch);
    }).on('change', function(path) {
      self._handleUpdatedFile(getPath(path)).then(dispatch);
    }).on('unlink', function(path) {
      self._handleDeletedFile(getPath(path)).then(dispatch);
    }).on('addDir', function(path) {
      fs.listDir(path).map(function(item) {
        var filePath = getPath(pathFn.join(path, item));
        return self._handleUpdatedFile(filePath).then(dispatch);
      });
    });

    return watcher;
  }).asCallback(callback);
};

Box.prototype.unwatch = function() {
  if (this.isWatching()) {
    this.watcher.close();
    this.watcher = null;
  }
};

Box.prototype.isWatching = function() {
  return Boolean(this.watcher);
};

module.exports = Box;
