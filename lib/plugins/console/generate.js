var async = require('async'),
  fs = require('graceful-fs'),
  _ = require('lodash'),
  pathFn = require('path'),
  colors = require('colors'),
  stream = require('stream'),
  Stream = stream.Stream,
  Readable = stream.Readable,
  util = require('../../util'),
  file = util.file2,
  HexoError = require('../../error');

module.exports = function(args, callback){
  var watch = args.w || args.watch,
    start = Date.now();

  var log = hexo.log,
    config = hexo.config,
    route = hexo.route,
    publicDir = hexo.public_dir,
    source_dir = hexo.source_dir,
    maxRetry = 3,
    cache = {};

  hexo.emit('generateBefore');

  var generateFile = function(path, content, callback){
    var dest = pathFn.join(publicDir, path),
      called = false;

    async.series([
      function(next){
        var parentDir = pathFn.dirname(dest);

        fs.exists(parentDir, function(exist){
          if (exist) return next();

          file.mkdirs(parentDir, next);
        });
      },
      function(next){
        var ws = fs.createWriteStream(dest),
          rs;

        ws.on('close', next)
          .on('error', next);

        if (content instanceof Stream){
          rs = content;
        } else {
          cache[path] = content;
          rs = new Readable();
          rs.push(content);
          rs.push(null); // EOF signal
        }

        rs.pipe(ws)
          .on('error', next);
      }
    ], function(err){
      if (called) return;

      called = true;

      callback(err);
    });
  };

  hexo.post.load({watch: watch}, function(err){
    if (err) return callback(err);

    var routes = route.routes,
      keys = Object.keys(routes),
      finish = Date.now(),
      elapsed = (finish - start) / 1000,
      count = 0;

    start = Date.now();

    log.i('Files loaded in %ss', elapsed.toFixed(3));

    async.auto({
      // Check whether the public folder exists
      exist: function(next){
        fs.exists(publicDir, function(exist){
          next(null, exist);
        });
      },
      // List all files in the public folder
      list: ['exist', function(next, results){
        if (!results.exist) return next(null, []);

        file.list(publicDir, next);
      }],
      // Generate files
      generate: ['list', function(next, results){
        var list = results.list,
          tasks = keys.slice(),
          retryCount = {};

        async.whilst(function(){
          return tasks.length;
        }, function(next){
          var i = tasks.shift(),
            fn = routes[i],
            exist = ~list.indexOf(i);

          if (exist && !fn.modified){
            log.log('skip', i);
            return next();
          }

          var start = Date.now();

          var itemCallback = function(err){
            if (err){
              if (err.code === 'EMFILE' && retryCount[i] < maxRetry){
                retryCount[i]++;
                log.d('EMFILE: %s (retry %d)', i, retryCount[i]);
                tasks.push(i);
              } else {
                next(HexoError.wrap(err, 'File generate failed: ' + i));
              }
            } else {
              count++;
              log.log(exist ? 'update' : 'create', 'Generated: %s ' + '(%dms)'.grey, i, Date.now() - start);
              next();
            }
          };

          fn(function(err, content){
            if (err) return next(HexoError.wrap(err, 'Render failed: ' + i));
            if (content == null) return next();

            generateFile(i, content, itemCallback);
          });
        }, next);
      }],
      // Clear old files
      clear: ['list', function(next, results){
        var list = _.difference(results.list, keys);

        async.each(list, function(i, next){
          var dest = pathFn.join(publicDir, i);

          fs.unlink(dest, function(err){
            if (err && err.code !== 'ENOENT'){
              next(HexoError.wrap(err, 'File delete failed: ' + i));
            } else {
              log.log('delete', 'Deleted: %s', i);
              next();
            }
          });
        }, next);
      }]
    }, function(err){
      if (err) return callback(err);

      var finish = Date.now(),
        elapsed = (finish - start) / 1000;

      hexo.emit('generateAfter');
      log.i('%d files generated in %ss', count, elapsed.toFixed(3));

      if (watch){
        route.on('update', function(path, fn){
          if (!fn.modified) return;

          fn(function(err, content){
            if (err) return log.e(HexoError.wrap(err, 'Render failed: ' + path));
            if (content == null) return;

            generateFile(path, content, function(err){
              if (err) return log.e(HexoError.wrap(err, 'File generate failed: ' + path));

              log.log('update', 'Generated: %s', path);
            });
          });
        }).on('remove', function(path){
          cache[path] = null;

          fs.unlink(pathFn.join(publicDir, path), function(err){
            if (err && err.code !== 'ENOENT'){
              log.e(HexoError.wrap(err, 'File delete failed: ' + i));
            } else {
              log.log('delete', 'Deleted: %s', path);
            }
          });
        });
      } else {
        if (args.d || args.deploy){
          hexo.call('deploy', callback);
        } else {
          callback();
        }
      }
    });
  });
};