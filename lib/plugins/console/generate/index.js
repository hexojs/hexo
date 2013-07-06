var async = require('async'),
  fs = require('graceful-fs'),
  _ = require('lodash'),
  extend = require('../../../extend'),
  call = require('../../../call'),
  util = require('../../../util'),
  file = util.file2,
  Pool = util.thread_pool,
  route = require('../../../route'),
  HexoError = require('../../../error'),
  log = hexo.log,
  config = hexo.config,
  publicDir = hexo.public_dir,
  sourceDir = hexo.source_dir;

extend.console.register('generate', 'Generate static files', {alias: 'g'}, function(args, callback){
  var watch = !!(args.w || args.watch),
    deploy = !!(args.d || args.deploy),
    start = Date.now(),
    pool = new Pool(require.resolve('./worker')),
    cache = {};

  var pushCallback = function(err){
    var item = this.data,
      path = item.dest.substring(publicDir.length);

    if (err){
      if (err.code === 'EMFILE'){
        q.push(item, pushCallback);
      } else {
        callback(HexoError(err, 'File generate failed: ' + path));
      }

      return;
    }

    log.i('Generated: %s', path);
  };

  log.i('Loading');
  hexo.emit('generateBefore');

  require('../../../load')({theme_watch: watch, source_watch: watch}, function(err){
    if (err) return callback(err);

    var list = route.list(),
      keys = Object.keys(list);

    async.auto({
      // Check if the public folder exists
      exist: function(next){
        fs.exists(publicDir, function(exist){
          next(null, exist);
        });
      },
      // Clear the public folder
      clear: ['exist', function(next, results){
        if (!results.exist){
          log.d('No need to clear old generated files because the public folder not exists');
          return next();
        }

        file.emptyDir(publicDir, {exclude: keys}, function(err){
          if (err) return callback(HexoError(err, 'Old generated files clear failed'));

          log.d('Old generated files cleared successfully');
          next();
        });
      }],
      // Generate files
      generate: ['exist', function(next, results){
        var exist = results.exist,
          arr = [];

        async.forEach(keys, function(i, next){
          var item = list[i],
            dest = publicDir + i;

          async.waterfall([
            function(next){
              if (!exist || item.modified) return next(null, true);

              fs.exists(dest, function(exist){
                next(null, !exist);
              });
            },
            function(push, next){
              if (!push) return next();

              item(function(err, result){
                if (err) return next(err);

                if (result.readable){
                  arr.push({
                    type: 'copy',
                    src: result.path,
                    dest: dest
                  });
                } else {
                  cache[i] = result;

                  arr.push({
                    type: 'normal',
                    dest: dest,
                    content: new Buffer(result)
                  });
                }

                next();
              });
            }
          ], next);
        }, function(){
          pool.push(arr, pushCallback);
          pool.drain = next;
        });
      }]
    }, function(err){
      if (err) return callback(err);

      var finish = Date.now(),
        elapsed = (finish - start) / 1000;

      hexo.emit('generateAfter');
      log.i('Site generated in %ss', elapsed.toFixed(3));

      if (watch){
        pool.drain = function(){};

        route.on('update', function(path, fn){
          if (!fn.modified) return;

          var dest = publicDir + path;

          route.get(path)(function(err, result){
            if (err) return log.e(HexoError(err, 'File render failed: ' + path));

            if (result.readable){
              pool.push({
                type: 'copy',
                src: result.path,
                dest: dest
              }, pushCallback);
            } else {
              if (cache[path] === result) return;

              cache[path] = result;

              pool.push({
                type: 'normal',
                dest: dest,
                content: new Buffer(result)
              }, pushCallback);
            }
          });
        }).on('remove', function(path){
          fs.unlink(publicDir + path, function(){
            log.i('Deleted: %s', path);
          });
        });
      } else {
        pool.end();

        if (deploy){
          call('deploy', callback);
        } else {
          callback();
        }
      }
    });
  });
});