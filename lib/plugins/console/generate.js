var fs = require('hexo-fs');
var pathFn = require('path');
var Promise = require('bluebird');
var prettyHrtime = require('pretty-hrtime');
var chalk = require('chalk');
var _ = require('lodash');

function generateConsole(args){
  var watch = args.w || args.watch;
  var route = this.route;
  var publicDir = this.public_dir;
  var log = this.log;
  var self = this;
  var start = process.hrtime();

  function generateFile(path){
    var data = route.get(path);
    var dest = pathFn.join(publicDir, path);
    var start = process.hrtime();

    // TODO: Retry when EMFILE error occurred
    return ensureWriteStream(dest).then(function(stream){
      return pipeStream(data, stream);
    }).then(function(){
      var interval = prettyHrtime(process.hrtime(start));
      log.info('Generated in %s: %s', chalk.cyan(interval), chalk.magenta(path));
    });
  }

  function deleteFile(path){
    var dest = pathFn.join(publicDir, path);

    return fs.unlink(dest).then(function(){
      log.info('Deleted: %s', chalk.magenta(path));
    }, function(err){
      // Skip ENOENT errors (file was deleted)
      if (err.cause.code !== 'ENOENT') throw err;
    });
  }

  function generateFiles(files){
    var list = route.list();

    return Promise.filter(list, function(path){
      // Skip a file which has existed already and is not modified
      var modified = route.isModified(path);
      return modified || !~files.indexOf(path);
    }).map(generateFile).then(function(arr){
      // Return the number of files generated
      return arr.length;
    });
  }

  function cleanFiles(files){
    var deleted = _.difference(files, route.list());

    return Promise.each(deleted, deleteFile);
  }

  function watchFiles(){
    // Watch changes of the route
    route.on('update', function(path){
      var modified = route.isModified(path);
      if (!modified) return;

      generateFile(path);
    });

    route.on('delete', deleteFile);
  }

  function deploy(){
    return self.call('deploy');
  }

  if (watch){
    log.info('Watching for file changes. Press Ctrl+C to stop.');
    watchFiles();
    return this.watch();
  }

  return this.load().then(function(){
    var interval = prettyHrtime(process.hrtime(start));
    log.info('Files loaded in %s', chalk.cyan(interval));

    // Check the existance of public folder
    return fs.exists(publicDir);
  }).then(function(exist){
    if (!exist) return [];

    // Get current file list in public folder
    return fs.listDir(publicDir).map(function(path){
      return path.replace(/\\/g, '/');
    });
  }).then(function(files){
    return Promise.all([
      generateFiles(files),
      cleanFiles(files)
    ]);
  }).spread(function(count){
    var interval = prettyHrtime(process.hrtime(start));
    log.info('%d files generated in %s', count, chalk.cyan(interval));

    if (args.d || args.deploy){
      return deploy();
    }
  });
}

// Make sure a stream is writable
function ensureWriteStream(path){
  var parent = pathFn.dirname(path);

  return fs.exists(parent).then(function(exist){
    if (exist) return;
    return fs.mkdirs(parent);
  }).then(function(){
    return fs.createWriteStream(path);
  });
}

// Pipe a stream from one to another
function pipeStream(rs, ws){
  return new Promise(function(resolve, reject){
    rs.pipe(ws)
      .on('error', reject);

    ws.on('close', resolve)
      .on('error', reject);
  });
}

module.exports = generateConsole;