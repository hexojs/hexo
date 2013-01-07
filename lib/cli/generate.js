var extend = require('../extend'),
  route = require('../route'),
  util = require('../util'),
  file = util.file,
  async = require('async'),
  fs = require('fs'),
  _ = require('underscore'),
  publicDir = hexo.public_dir;

extend.console.register('generate', 'Generate static files', function(args){
  args = args.join().toLowerCase();

  var ignoreTheme = args.match(/-t|--theme/i) ? true : false,
    start = new Date();

  console.log('Loading.');
  hexo.emit('generateBefore');

  require('../generate')({ignore: ignoreTheme}, function(err, cache){
    var list = route.list(),
      keys = Object.keys(list);

    hexo.emit('generate');
    console.log('Generating.');

    async.waterfall([
      function(next){
        fs.exists(publicDir, function(exist){
          if (!exist) return next();
          file.empty(publicDir, keys.concat(cache), next);
        });
      },
      function(next){
        var queue = async.queue(function(key, next){
          list[key](function(err, result){
            if (err) throw err;

            if (result.readable){
              file.copy(result.path, publicDir + result.source, next);
            } else {
              file.write(publicDir + key, result, next);
            }
          });
        }, 1024);

        queue.push(keys, function(err){
          if (err) throw err;
        });

        queue.drain = next;
      }
    ], function(err){
      if (err) throw err;

      var finish = new Date(),
        elapsed = (finish.getTime() - start.getTime()) / 1000;
      console.log('Site generated in %ss.', elapsed.toFixed(3));
      hexo.emit('generateAfter');
    });
  });
});