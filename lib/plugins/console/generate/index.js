var async = require('async'),
  fs = require('graceful-fs'),
  pathFn = require('path'),
  util = require('../../../util'),
  Pool = util.pool,
  file = util.file2,
  HexoError = require('../../../error');

module.exports = function(args, callback){
  var watchOption = args.w || args.watch,
    start = Date.now(),
    count = 0;

  var log = hexo.log,
    config = hexo.config,
    route = hexo.route,
    publicDir = hexo.public_dir;

  var workerPath = require.resolve('./worker'),
    q;

  if (config.multi_thread){
    if (config.multi_thread === true){
      q = new Pool(workerPath);
    } else {
      q = new Pool(workerPath, config.multi_thread);
    }
  } else {
    q = async.queue(function(data, next){
      var path = data.path,
        dest = pathFn.join(publicDir, path);

      route.get(data.path)(function(err, result){
        if (result.readable){
          file.copyFile(result.path, dest, next);
        } else {
          file.writeFile(dest, result, next);
        }
      });
    }, config.max_open_file);
  }

  var pushCallback = function(err){
    var data = this.data,
      path = data.path;

    if (err){
      if (err.code === 'EMFILE'){
        q.push(data, pushCallback);
      } else {
        callback(HexoError.wrap(err, 'File generate failed: ' + path));
      }

      return;
    }

    count++;
    log.log('create', 'Public: %s', path);
  };

  /**
  * Fired before generation started.
  *
  * @event generateBefore
  * @for Hexo
  */
  hexo.emit('generateBefore');

  hexo.post.load({watch: watchOption}, function(err){
    if (err) return callback(err);

    var list = route.routes,
      keys = Object.keys(list),
      finish = Date.now(),
      elapsed = (finish - start) / 1000;

    log.i('Files loaded in %ss', elapsed.toFixed(3));

    async.auto({
      // Initialize workers
      worker: function(next){
        var initData = [];

        for (var i = 0; i < q.concurrency; i++){
          initData.push({type: 'init'});
        }

        q.push(initData, function(err){
          if (err) return next(err);
        });

        q.drain = next;
      },
      // Check whether the public folder exists
      exist: function(next){
        fs.exists(publicDir, function(exist){
          next(null, exist);
        });
      },
      // Clear the public folder
      clear: ['exist', function(next, results){
        if (!results.exist) return next();

        var exclude = keys.map(function(item){
          return pathFn.normalize(item);
        });

        file.emptyDir(publicDir, {exclude: exclude}, function(err){
          if (err) return callback(HexoError.wrap(err, 'Public folder clear failed'));

          log.d('Public folder cleared');
          next();
        });
      }],
      // Make a file list for generating
      list: ['exist', function(next, results){
        var exist = results.exist;

        if (!exist){
          return next(null, keys);
        }

        var arr = [];

        async.each(keys, function(i, next){
          if (list[i].modified){
            arr.push(i);
            return next();
          }

          fs.exists(pathFn.join(publicDir, i), function(exist){
            if (!exist) arr.push(i);
            next();
          });
        }, function(err){
          next(err, arr);
        });
      }],
      // Start generating
      generate: ['list', 'worker', function(next, results){
        var list = results.list;

        if (!list.length) return next();

        var data = list.map(function(item){
          return {type: 'generate', path: item};
        });

        q.push(data, pushCallback);
        q.drain = next;
      }]
    }, function(err){
      var finish = Date.now(),
        elapsed = (finish - start) / 1000;

      /**
      * Fired after generation done.
      *
      * @event generateAfter
      * @for Hexo
      */
      hexo.emit('generateAfter');
      log.i('%d files generated in %ss', count, elapsed.toFixed(3));

      if (watchOption){
        q.drain = function(){};

        hexo.log.i('Start watching. Press Ctrl+C to stop.');

        route.on('update', function(path){
          q.push({type: 'generate', path: path}, pushCallback);
        }).on('remove', function(path){
          fs.unlink(pathFn.join(publicDir, path), function(err){
            if (err) return log.e(HexoError.wrap(err, 'File delete failed: ' + path));

            log.log('delete', 'Public: %s', path);
          });
        });
      } else {
        if (config.multi_thread) q.end();

        if (args.d || args.deploy){
          hexo.call('deploy', callback);
        } else {
          callback();
        }
      }
    });
  });
};