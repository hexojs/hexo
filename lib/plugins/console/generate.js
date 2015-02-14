'use strict';

var fs = require('hexo-fs');
var pathFn = require('path');
var Promise = require('bluebird');
var prettyHrtime = require('pretty-hrtime');
var chalk = require('chalk');
var _ = require('lodash');
var ShasumStream = require('../../box/shasum_stream');

var join = pathFn.join;

function generateConsole(args){
  /* jshint validthis: true */
  var route = this.route;
  var publicDir = this.public_dir;
  var log = this.log;
  var self = this;
  var start = process.hrtime();
  var Cache = this.model('Cache');

  function generateFile(path){
    var dest = join(publicDir, path);

    return fs.exists(dest).then(function(exist){
      if (exist && !route.isModified(path)) return;

      return checkShasum(path).then(function(changed){
        if (changed || !exist) return writeFile(path);
      });
    });
  }

  function writeFile(path){
    var dest = join(publicDir, path);

    return fs.ensureWriteStream(dest).then(function(stream){
      if (!stream) return false;

      return pipeStream(route.get(path), stream).then(function(){
        log.info('Generated: %s', chalk.magenta(path));
        return true;
      });
    });
  }

  function checkShasum(path){
    var data = route.get(path);
    var id = 'public/' + path;
    var stream = new ShasumStream();

    return pipeStream(data, stream).then(function(){
      var shasum = stream.getShasum();
      var cache = Cache.findById(id);

      if (cache){
        if (cache.shasum === shasum) return;
      } else {
        cache = Cache.new({_id: id});
      }

      cache.shasum = shasum;
      cache.modified = Date.now();

      return cache.save();
    });
  }

  function deleteFile(path){
    var dest = join(publicDir, path);

    return fs.unlink(dest).then(function(){
      log.info('Deleted: %s', chalk.magenta(path));
    }, function(err){
      // Skip ENOENT errors (file was deleted)
      if (err.cause.code !== 'ENOENT') throw err;
    });
  }

  function generateFiles(files){
    var list = route.list();

    return Promise.reduce(list, function(result, path){
      return generateFile(path).then(function(success){
      return success ? result + 1 : result;
      });
    }, 0);
  }

  function cleanFiles(files){
    var deleted = _.difference(files, route.list());

    return Promise.map(deleted, deleteFile);
  }

  function firstGenerate(){
    // Show the loading time
    var interval = prettyHrtime(process.hrtime(start));
    log.info('Files loaded in %s', chalk.cyan(interval));

    // Reset the timer for later usage
    start = process.hrtime();

    // Check the existance of public folder
    return fs.exists(publicDir).then(function(exist){
      if (!exist){
        // Create public folder if not exist
        return fs.mkdirs(publicDir);
      }

      // Get current file list in public folder
      return fs.listDir(publicDir).map(function(path){
        return path.replace(/\\/g, '/');
      });
    }).then(function(files){
      files = files || [];

      return Promise.all([
        generateFiles(files),
        cleanFiles(files)
      ]);
    }).spread(function(count){
      var interval = prettyHrtime(process.hrtime(start));
      log.info('%d files generatd in %s', count, chalk.cyan(interval));
    });
  }

  if (args.w || args.watch){
    return this.watch().then(firstGenerate).then(function(){
      log.info('Hexo is watching for file changes. Press Ctrl+C to exit.');

      // Watch changes of the route
      route.on('update', function(path){
        var modified = route.isModified(path);
        if (!modified) return;

        generateFile(path);
      }).on('remove', function(path){
        deleteFile(path);
      });
    });
  }

  return this.load().then(firstGenerate).then(function(){
    if (args.d || args.deploy){
      return self.call('deploy', args);
    }
  });
}

// Pipe a stream from one to another
function pipeStream(rs, ws){
  return new Promise(function(resolve, reject){
    rs.pipe(ws)
      .on('error', reject)
      .on('finish', resolve);
  });
}

module.exports = generateConsole;