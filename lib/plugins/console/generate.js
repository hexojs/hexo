'use strict';

const fs = require('hexo-fs');
const { join } = require('path');
const Promise = require('bluebird');
const prettyHrtime = require('pretty-hrtime');
const { cyan, magenta } = require('chalk');
const tildify = require('tildify');
const { PassThrough } = require('stream');
const { createSha1Hash } = require('hexo-util');

function generateConsole(args = {}) {
  const force = args.f || args.force;
  const bail = args.b || args.bail;
  const concurrency = args.c || args.concurrency;
  const { route, log } = this;
  const publicDir = this.public_dir;
  let start = process.hrtime();
  const Cache = this.model('Cache');
  const generatingFiles = {};

  function generateFile(path) {
    // Skip if the file is generating
    if (generatingFiles[path]) return Promise.resolve();

    // Lock the file
    generatingFiles[path] = true;

    let promise;

    if (force) {
      promise = writeFile(path, true);
    } else {
      const dest = join(publicDir, path);
      promise = fs.exists(dest).then(exist => {
        if (!exist) return writeFile(path, true);
        if (route.isModified(path)) return writeFile(path);
      });
    }

    return promise.finally(() => {
      // Unlock the file
      generatingFiles[path] = false;
    });
  }

  function writeFile(path, force) {
    const dataStream = wrapDataStream(route.get(path), bail);
    const buffers = [];
    const hasher = createSha1Hash();

    const finishedPromise = new Promise((resolve, reject) => {
      dataStream.once('error', reject);
      dataStream.once('end', resolve);
    });

    // Get data => Cache data => Calculate hash
    dataStream.on('data', chunk => {
      buffers.push(chunk);
      hasher.update(chunk);
    });

    return finishedPromise.then(() => {
      const dest = join(publicDir, path);
      const cacheId = `public/${path}`;
      const cache = Cache.findById(cacheId);
      const hash = hasher.digest('hex');

      // Skip generating if hash is unchanged
      if (!force && cache && cache.hash === hash) {
        return;
      }

      // Save new hash to cache
      return Cache.save({
        _id: cacheId,
        hash
      }).then(() => // Write cache data to public folder
        fs.writeFile(dest, Buffer.concat(buffers))).then(() => {
        log.info('Generated: %s', magenta(path));
        return true;
      });
    });
  }

  function deleteFile(path) {
    const dest = join(publicDir, path);

    return fs.unlink(dest).then(() => {
      log.info('Deleted: %s', magenta(path));
    }, err => {
      // Skip ENOENT errors (file was deleted)
      if (err && err.code === 'ENOENT') return;
      throw err;
    });
  }

  function wrapDataStream(dataStream, bail) {
    // Pass original stream with all data and errors
    if (bail) {
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
    log.info('Files loaded in %s', cyan(interval));

    // Reset the timer for later usage
    start = process.hrtime();

    // Check the public folder
    return fs.stat(publicDir).then(stats => {
      if (!stats.isDirectory()) {
        throw new Error('%s is not a directory', magenta(tildify(publicDir)));
      }
    }).catch(err => {
      // Create public folder if not exists
      if (err && err.code === 'ENOENT') {
        return fs.mkdirs(publicDir);
      }

      throw err;
    }).then(() => {
      const task = (fn, path) => () => fn(path);
      const doTask = fn => fn();
      const routeList = route.list();
      const publicFiles = Cache.filter(item => item._id.startsWith('public/')).map(item => item._id.substring(7));
      const tasks = publicFiles.filter(path => !routeList.includes(path))
        // Clean files
        .map(path => task(deleteFile, path))
        // Generate files
        .concat(routeList.map(path => task(generateFile, path)));

      return Promise.all(Promise.map(tasks, doTask, { concurrency: parseFloat(concurrency || 'Infinity') }));
    }).then(result => {
      const interval = prettyHrtime(process.hrtime(start));
      const count = result.filter(Boolean).length;

      log.info('%d files generated in %s', count, cyan(interval));
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
      return this.call('deploy', args);
    }
  });
}

module.exports = generateConsole;
