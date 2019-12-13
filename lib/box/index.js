'use strict';

const { join, sep } = require('path');
const Promise = require('bluebird');
const File = require('./file');
const { Pattern, HashStream } = require('hexo-util');
const { createReadStream, readdir, stat, watch } = require('hexo-fs');
const { magenta } = require('chalk');
const { EventEmitter } = require('events');
const { inherits } = require('util');
const { isMatch, makeRe } = require('micromatch');
const ignore = ['**/themes/*/node_modules/**', '**/themes/*/.git/**'];

const defaultPattern = new Pattern(() => ({}));

function Box(ctx, base, options) {
  Reflect.apply(EventEmitter, this, []);

  this.options = Object.assign({
    persistent: true
  }, options);

  if (!base.endsWith(sep)) {
    base += sep;
  }

  this.context = ctx;
  this.base = base;
  this.processors = [];
  this._processingFiles = {};
  this.watcher = null;
  this.Cache = ctx.model('Cache');
  this.File = this._createFileClass();

  let ignoreCfg = ignore;
  if (ctx.config.ignore) {
    if (ctx.config.ignore.length) ignoreCfg = ignoreCfg.concat(ctx.config.ignore);
  }
  this.ignore = ignoreCfg;
  const targets = ignoreCfg;
  this.options.ignored = (this.options.ignored || []).concat(targets.map(s => toRegExp(ctx, s)).filter(x => x));
}

inherits(Box, EventEmitter);

function escapeBackslash(path) {
  // Replace backslashes on Windows
  return path.replace(/\\/g, '/');
}

function getHash(path) {
  return new Promise((resolve, reject) => {
    const src = createReadStream(path);
    const hasher = new HashStream();

    src.pipe(hasher)
      .on('finish', () => {
        resolve(hasher.read().toString('hex'));
      })
      .on('error', reject);
  });
}

function toRegExp(ctx, arg) {
  if (!arg) return null;
  if (typeof arg !== 'string') {
    ctx.log.warn('A value of "ignore:" section in "_config.yml" is not invalid (not a string)');
    return null;
  }
  const result = makeRe(arg);
  if (!result) {
    ctx.log.warn('A value of "ignore:" section in "_config.yml" can not be converted to RegExp:' + arg);
    return null;
  }
  return result;
}

Box.prototype._createFileClass = function() {
  const ctx = this.context;

  const _File = function(data) {
    Reflect.apply(File, this, [data]);
  };

  inherits(_File, File);

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
    pattern,
    process: fn
  });
};

Box.prototype._readDir = function(base, fn, prefix = '') {
  const { ignore } = this;

  if (base && ignore) {
    if (ignore.length && isMatch(base, ignore)) {
      return Promise.resolve([]);
    }
  }

  return readdir(base).map(path => stat(join(base, path)).then(stats => {
    const fullpath = join(base, path);
    if (stats.isDirectory()) {
      return this._readDir(fullpath, fn, `${prefix + path}/`);
    }

    if (ignore && ignore.length && isMatch(fullpath, ignore)) {
      return Promise.resolve([]);
    }

    return this._checkFileStatus(prefix + path).then(file => fn(file).thenReturn(file));
  })).catch(err => {
    if (err.cause && err.cause.code === 'ENOENT') return;
    throw err;
  }).reduce((files, item) => files.concat(item), []);
};

Box.prototype._checkFileStatus = function(path) {
  const { Cache, context: ctx } = this;
  const src = join(this.base, path);

  return Cache.compareFile(
    escapeBackslash(src.substring(ctx.base_dir.length)),
    () => getHash(src),

    () => stat(src)
  ).then(result => ({
    type: result.type,
    path
  }));
};

Box.prototype.process = function(callback) {
  const { base, Cache, context: ctx } = this;

  return stat(base).then(stats => {
    if (!stats.isDirectory()) return;

    // Check existing files in cache
    const relativeBase = escapeBackslash(base.substring(ctx.base_dir.length));
    const cacheFiles = Cache.filter(item => item._id.startsWith(relativeBase)).map(item => item._id.substring(relativeBase.length));

    // Read files from directory
    return this._readDir(base, file => this._processFile(file.type, file.path)).map(file => file.path).then(files => // Handle deleted files
      Promise.filter(cacheFiles, path => !files.includes(path)).map(path => this._processFile(File.TYPE_DELETE, path)));
  }).catch(err => {
    if (err.cause && err.cause.code !== 'ENOENT') throw err;
  }).asCallback(callback);
};

Box.prototype.load = Box.prototype.process;

Box.prototype._processFile = function(type, path) {
  if (this._processingFiles[path]) {
    return Promise.resolve();
  }

  this._processingFiles[path] = true;

  const { base, File, context: ctx } = this;

  this.emit('processBefore', {
    type,
    path
  });

  return Promise.reduce(this.processors, (count, processor) => {
    const params = processor.pattern.match(path);
    if (!params) return count;

    const file = new File({
      source: join(base, path),
      path,
      params,
      type
    });

    return Reflect.apply(Promise.method(processor.process), ctx, [file])
      .thenReturn(count + 1);
  }, 0).then(count => {
    if (count) {
      ctx.log.debug('Processed: %s', magenta(path));
    }

    this.emit('processAfter', {
      type,
      path
    });
  }).catch(err => {
    ctx.log.error({err}, 'Process failed: %s', magenta(path));
  }).finally(() => {
    this._processingFiles[path] = false;
  }).thenReturn(path);
};

Box.prototype.watch = function(callback) {
  if (this.isWatching()) {
    return Promise.reject(new Error('Watcher has already started.')).asCallback(callback);
  }

  const { base } = this;

  function getPath(path) {
    return escapeBackslash(path.substring(base.length));
  }

  return this.process().then(() => watch(base, this.options)).then(watcher => {
    this.watcher = watcher;

    watcher.on('add', path => {
      this._processFile(File.TYPE_CREATE, getPath(path));
    });

    watcher.on('change', path => {
      this._processFile(File.TYPE_UPDATE, getPath(path));
    });

    watcher.on('unlink', path => {
      this._processFile(File.TYPE_DELETE, getPath(path));
    });

    watcher.on('addDir', path => {
      let prefix = getPath(path);
      if (prefix) prefix += '/';

      this._readDir(path, file => this._processFile(file.type, file.path), prefix);
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
