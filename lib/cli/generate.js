var extend = require('../extend'),
  route = require('../route'),
  util = require('../util'),
  file = util.file,
  inherits = require('util').inherits,
  async = require('async'),
  clc = require('cli-color'),
  fs = require('fs'),
  _ = require('underscore'),
  publicDir = hexo.public_dir;

var GenerateError = function(path, msg){
  console.log(path);
  console.error(msg);
};

inherits(GenerateError, Error);
GenerateError.prototype.name = 'Generate Error';

extend.console.register('generate', 'Generate static files', function(args){
  args = args.join().toLowerCase();

  var ignoreTheme = args.match(/-t|--theme/i) ? true : false,
    watch = args.match(/-w|--watch/i) ? true : false,
    start = new Date();

  console.log('Loading.');
  hexo.emit('generateBefore');

  require('../generate')({ignore: ignoreTheme, watch: watch}, function(err, cache){
    var list = route.list(),
      keys = Object.keys(list);

    hexo.emit('generate');
    console.log('Generating.');

    async.parallel([
      function(next){
        fs.exists(publicDir, function(exist){
          if (!exist) return next();
          file.empty(publicDir, keys.concat(cache), next);
        });
      },
      function(next){
        var queue = async.queue(function(key, next){
          list[key](function(err, result){
            if (err) throw new GenerateError(key, err);

            if (result.readable){
              if (hexo.debug) console.log('Copying %s', clc.bold(result.path));
              file.copy(result.path, publicDir + result.source, next);
            } else {
              if (hexo.debug) console.log('Writing %s', clc.bold(publicDir + key));
              file.write(publicDir + key, result, next);
            }
          });
        }, 512);

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