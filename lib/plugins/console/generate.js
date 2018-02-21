'use strict';

const fs = require('hexo-fs');
const pathFn = require('path');
const Promise = require('bluebird');
const prettyHrtime = require('pretty-hrtime');
const chalk = require('chalk');
const tildify = require('tildify');
const Transform = require('stream').Transform;
const PassThrough = require('stream').PassThrough;
const _ = require('lodash');
const util = require('hexo-util');

const join = pathFn.join;

function generateConsole(args = {}) {
  const force = args.f || args.force;
  const bail = args.b || args.bail;
  const route = this.route;
  const publicDir = this.public_dir;
  const log = this.log;
  const self = this;
  let start = process.hrtime();
  const Cache = this.model('Cache');
  const generatingFiles = {};

  function generateFile(path) {
    // Skip if the file is generating
    if (generatingFiles[path]) return Promise.resolve();

    // Lock the file
    generatingFiles[path] = true;

    const dest = join(publicDir, path);

    return fs.exists(dest).then(exist => {
      if (force || !exist) return writeFile(path, true);
      if (route.isModified(path)) return writeFile(path);
    }).finally(() => {
      // Unlock the file
      generatingFiles[path] = false;
    });
  }

  function writeFile(path, force) {
    const dest = join(publicDir, path);
    const cacheId = `public/${path}`;
    const dataStream = wrapDataStream(route.get(path), {bail});
    const cacheStream = new CacheStream();
    const hashStream = new util.HashStream();

    // Get data => Cache data => Calculate hash
    return pipeStream(dataStream, cacheStream, hashStream).then(() => {
      const cache = Cache.findById(cacheId);
      const hash = hashStream.read().toString('hex');

      // Skip generating if hash is unchanged
      if (!force && cache && cache.hash === hash) {
        return;
      }

      // Save new hash to cache
      return Cache.save({
        _id: cacheId,
        hash
      }).then(() => // Write cache data to public folder
        fs.writeFile(dest, cacheStream.getCache())).then(() => {
        log.info('Generated: %s', chalk.magenta(path));
        return true;
      });
    }).finally(() => {
      // Destroy cache
      cacheStream.destroy();
    });
  }

  function deleteFile(path) {
    const dest = join(publicDir, path);

    return fs.unlink(dest).then(() => {
      log.info('Deleted: %s', chalk.magenta(path));
    }, err => {
      // Skip ENOENT errors (file was deleted)
      if (err.cause && err.cause.code === 'ENOENT') return;
      throw err;
    });
  }

  function wrapDataStream(dataStream, options) {
    const bail = options && options.bail;

    // Pass original stream with all data and errors
    if (bail === true) {
      return dataStream;
    }

    // Pass all data, but don't populate errors
    dataStream.on('error', err => {
      log.error(err);
    });

    return dataStream.pipe(new PassThrough());
  }

  function firstGenerate() {
    // Show the loading time
    const interval = prettyHrtime(process.hrtime(start));
    log.info('Files loaded in %s', chalk.cyan(interval));

    // Reset the timer for later usage
    start = process.hrtime();

    // Check the public folder
    return fs.stat(publicDir).then(stats => {
      if (!stats.isDirectory()) {
        throw new Error('%s is not a directory', chalk.magenta(tildify(publicDir)));
      }
    }).catch(err => {
      // Create public folder if not exists
      if (err.cause && err.cause.code === 'ENOENT') {
        return fs.mkdirs(publicDir);
      }

      throw err;
    }).then(() => {
      const routeList = route.list();
      const publicFiles = Cache.filter(item => item._id.substring(0, 7) === 'public/').map(item => item._id.substring(7));

      return Promise.all([
        // Generate files
        Promise.map(routeList, generateFile),

        // Clean files
        Promise.filter(publicFiles, path => !~routeList.indexOf(path)).map(deleteFile)
      ]);
    }).spread(result => {
      const interval = prettyHrtime(process.hrtime(start));
      const count = result.filter(Boolean).length;

      log.info('%d files generated in %s', count, chalk.cyan(interval));
    });
  }

  if (args.w || args.watch) {
    return this.watch().then(firstGenerate).then(() => {
      log.info('Hexo is watching for file changes. Press Ctrl+C to exit.');

      // Watch changes of the route
      route.on('update', path => {
        const modified = route.isModified(path);
        if (!modified) return;

        generateFile(path);
      }).on('remove', path => {
        deleteFile(path);
      });
    });
  }

  return this.load().then(firstGenerate).then(() => {
    if (args.d || args.deploy) {
      return self.call('deploy', args);
    }
  });
}

// Pipe a stream from one to another
function pipeStream() {
  const args = _.toArray(arguments);
  const src = args.shift();

  return new Promise((resolve, reject) => {
    let stream = src.on('error', reject);
    let target;

    while ((target = args.shift()) != null) {
      stream = stream.pipe(target).on('error', reject);
    }

    stream.on('finish', resolve);
    stream.on('end', resolve);
    stream.on('close', resolve);
  });
}

function CacheStream() {
  Transform.call(this);

  this._cache = [];
}

require('util').inherits(CacheStream, Transform);

CacheStream.prototype._transform = function(chunk, enc, callback) {
  const buf = chunk instanceof Buffer ? chunk : Buffer.from(chunk, enc);

  this._cache.push(buf);
  this.push(buf);
  callback();
};

CacheStream.prototype.destroy = function() {
  this._cache.length = 0;
};

CacheStream.prototype.getCache = function() {
  return Buffer.concat(this._cache);
};

module.exports = generateConsole;
