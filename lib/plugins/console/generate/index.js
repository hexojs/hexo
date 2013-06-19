var async = require('async'),
  fs = require('graceful-fs'),
  _ = require('lodash'),
  extend = require('../../../extend'),
  call = require('../../../call'),
  util = require('../../../util'),
  file = util.file2,
  route = require('../../../route'),
  HexoError = require('../../../error'),
  log = hexo.log,
  config = hexo.config,
  maxOpenFile = config.max_open_file,
  publicDir = hexo.public_dir,
  sourceDir = hexo.source_dir;

extend.console.register('generate', 'Generate static files', {alias: 'g'}, function(args, callback){
  var watch = !!(args.w || args.watch),
    deploy = !!(args.d || args.deploy),
    start = Date.now(),
    cache = {};

  var q = async.queue(function(path, next){
    route.get(path)(function(err, result){
      if (err) return next(err);

      var target = publicDir + path;

      if (result.readable){
        file.copyFile(result.path, target, next);
      } else {
        if (cache[path] === result) return next();

        cache[path] = result;
        file.writeFile(target, result, next);
      }

      log.i('Generating: ' + path);
    });
  }, maxOpenFile);

  var pushQueue = function(err){
    var item = this.data;

    if (err){
      if (err.code === 'EMFILE'){
        q.push(item, pushQueue);
      } else {
        return callback(HexoError(err, 'File generate failed: ' + item));
      }
    }
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
        if (results.exist){
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
          var item = list[i];

          if (!exist || item.modified){
            arr.push(i);
            return next();
          }

          fs.exists(publicDir + i, function(exist){
            if (!exist) arr.push(i);

            next();
          });
        }, function(){
          q.push(arr, pushQueue);

          q.drain = next;
        });
      }]
    }, function(err){
      if (err) return callback(err);

      var finish = Date.now(),
        elapsed = (finish - start) / 1000;

      hexo.emit('generateAfter');
      log.i('Site generated in %ss', elapsed.toFixed(3));

      if (watch){
        q.drain = function(){};

        route.on('update', function(path, fn){
          if (!fn.modified) return;

          q.push(path, pushQueue);
        }).on('remove', function(path){
          var target = publicDir + path;

          fs.unlink(target, function(){
            log.i('Deleted: ' + path);
          });
        });
      } else {
        if (deploy){
          call('deploy', callback);
        } else {
          callback();
        }
      }
    });
  });
});