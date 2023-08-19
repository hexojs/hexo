import { join, sep } from 'path';
import BlueBirdPromise from 'bluebird';
import File from './file';
import { Pattern, createSha1Hash } from 'hexo-util';
import { createReadStream, readdir, stat, watch } from 'hexo-fs';
import { magenta } from 'picocolors';
import { EventEmitter } from 'events';
import { isMatch, makeRe } from 'micromatch';
import type Hexo from '../hexo';

const defaultPattern = new Pattern(() => ({}));

interface Processor {
  pattern: Pattern;
  process: (file: File) => void;
}

class Box extends EventEmitter {
  public options: any;
  public context: Hexo;
  public base: string;
  public processors: Processor[];
  public _processingFiles: any;
  public watcher: any;
  public Cache: any;
  // TODO: replace runtime class _File
  public File: any;
  public ignore: any[];
  public source: any;
  public emit: any;
  public ctx: any;

  constructor(ctx: Hexo, base: string, options?: object) {
    super();

    this.options = Object.assign({
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 200
      }
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
    let targets = this.options.ignored || [];
    if (ctx.config.ignore && ctx.config.ignore.length) {
      targets = targets.concat(ctx.config.ignore);
    }
    this.ignore = targets;
    this.options.ignored = targets.map(s => toRegExp(ctx, s)).filter(x => x);
  }

  _createFileClass() {
    const ctx = this.context;

    class _File extends File {
      public box: Box;

      render(options?: any) {
        return ctx.render.render({
          path: this.source
        }, options);
      }

      renderSync(options?: any) {
        return ctx.render.renderSync({
          path: this.source
        }, options);
      }
    }

    _File.prototype.box = this;

    return _File;
  }

  addProcessor(pattern: (...args: any[]) => any);
  addProcessor(pattern: string | RegExp | Pattern | ((...args: any[]) => any), fn: (...args: any[]) => any);
  addProcessor(pattern: string | RegExp | Pattern | ((...args: any[]) => any), fn?: (...args: any[]) => any) {
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
  }

  _readDir(base: string, prefix = '') {
    const { context: ctx } = this;
    const results = [];
    return readDirWalker(ctx, base, results, this.ignore, prefix)
      .return(results)
      .map(path => this._checkFileStatus(path))
      .map(file => this._processFile(file.type, file.path).return(file.path));
  }

  _checkFileStatus(path: string) {
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
  }

  process(callback?: (...args: any[]) => any) {
    const { base, Cache, context: ctx } = this;

    return stat(base).then(stats => {
      if (!stats.isDirectory()) return;

      // Check existing files in cache
      const relativeBase = escapeBackslash(base.substring(ctx.base_dir.length));
      const cacheFiles = Cache.filter(item => item._id.startsWith(relativeBase)).map(item => item._id.substring(relativeBase.length));

      // Handle deleted files
      return this._readDir(base)
        .then(files => cacheFiles.filter(path => !files.includes(path)))
        .map(path => this._processFile(File.TYPE_DELETE, path));
    }).catch(err => {
      if (err && err.code !== 'ENOENT') throw err;
    }).asCallback(callback);
  }

  _processFile(type: string, path: string) {
    if (this._processingFiles[path]) {
      return BlueBirdPromise.resolve();
    }

    this._processingFiles[path] = true;

    const { base, File, context: ctx } = this;

    this.emit('processBefore', {
      type,
      path
    });

    return BlueBirdPromise.reduce(this.processors, (count, processor) => {
      const params = processor.pattern.match(path);
      if (!params) return count;

      const file = new File({
        source: join(base, path),
        path,
        params,
        type
      });

      return Reflect.apply(BlueBirdPromise.method(processor.process), ctx, [file])
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
      ctx.log.error({ err }, 'Process failed: %s', magenta(path));
    }).finally(() => {
      this._processingFiles[path] = false;
    }).thenReturn(path);
  }

  watch(callback?: (...args: any[]) => any) {
    if (this.isWatching()) {
      return BlueBirdPromise.reject(new Error('Watcher has already started.')).asCallback(callback);
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

        this._readDir(path, prefix);
      });
    }).asCallback(callback);
  }

  unwatch() {
    if (!this.isWatching()) return;

    this.watcher.close();
    this.watcher = null;
  }

  isWatching() {
    return Boolean(this.watcher);
  }
}

function escapeBackslash(path: string) {
  // Replace backslashes on Windows
  return path.replace(/\\/g, '/');
}

function getHash(path: string) {
  const src = createReadStream(path);
  const hasher = createSha1Hash();

  const finishedPromise = new BlueBirdPromise((resolve, reject) => {
    src.once('error', reject);
    src.once('end', resolve);
  });

  src.on('data', chunk => { hasher.update(chunk); });

  return finishedPromise.then(() => hasher.digest('hex'));
}

function toRegExp(ctx: Hexo, arg: string) {
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

function isIgnoreMatch(path: string, ignore: string | any[]) {
  return path && ignore && ignore.length && isMatch(path, ignore);
}

function readDirWalker(ctx: Hexo, base: string, results: any[], ignore: any, prefix: string) {
  if (isIgnoreMatch(base, ignore)) return BlueBirdPromise.resolve();

  return BlueBirdPromise.map(readdir(base).catch(err => {
    ctx.log.error({ err }, 'Failed to read directory: %s', base);
    if (err && err.code === 'ENOENT') return [];
    throw err;
  }), async path => {
    const fullpath = join(base, path);
    const stats = await stat(fullpath).catch(err => {
      ctx.log.error({ err }, 'Failed to stat file: %s', fullpath);
      if (err && err.code === 'ENOENT') return null;
      throw err;
    });
    const prefixPath = `${prefix}${path}`;
    if (stats) {
      if (stats.isDirectory()) {
        return readDirWalker(ctx, fullpath, results, ignore, `${prefixPath}/`);
      }
      if (!isIgnoreMatch(fullpath, ignore)) {
        results.push(prefixPath);
      }
    }
  });
}

export interface _File extends File {
  box: Box;
  render(options?: any): any;
  renderSync(options?: any): any;
}

export default Box;
