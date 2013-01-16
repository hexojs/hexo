var extend = require('../extend'),
  route = require('../route'),
  util = require('../util'),
  file = util.file,
  spawn = util.spawn,
  utilFn = require('util'),
  inherits = utilFn.inherits,
  format = utilFn.format,
  async = require('async'),
  colors = require('colors'),
  fs = require('fs'),
  _ = require('underscore'),
  publicDir = hexo.public_dir,
  stdout = hexo.process.stdout,
  config = hexo.config,
  maxOpenFile = config.max_open_file || 100,
  cache = {};

var process = function(cache, callback){
  var list = route.list(),
    keys = Object.keys(list),
    total = keys.length,
    now = 0,
    generate = require('../generate');

  stdout.write('Generating.');

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
          if (err) throw new Error('Generate Error: ' + key);

          var process = format('%s% (%s/%s)', (now / total * 100).toFixed(2), now++, total);
          stdout.write('\rGenerating. ' + process);

          if (result.readable){
            if (hexo.debug) console.log('Copying %s', result.path.bold);
            file.copy(result.path, publicDir + result.source, next);
          } else {
            if (cache[key] !== result){
              cache[key] = result;
              if (hexo.debug) console.log('Writing %s', (publicDir + key).bold);
              file.write(publicDir + key, result, next);
            } else {
              next();
            }
          }
        });
      }, maxOpenFile);

      queue.push(keys, function(err){
        if (err) throw err;
      });

      queue.drain = function(){
        stdout.write('\x1b[1K\rGenerated completely.\n');
        callback();
      };
    }
  ]);
};

extend.console.register('generate', 'Generate static files', function(args){
  var ignore = args.t || args.theme ? true : false,
    watch = args.w || args.watch ? true : false,
    deploy = args.d || args.deploy ? true : false,
    start = new Date(),
    generate = require('../generate'),
    watchFn = require('../watch');

  console.log('Loading.');
  hexo.emit('generateBefore');

  generate({ignore: ignore}, function(err, cache){
    process(cache, function(){
      if (watch){
        console.log('Hexo is watching file changes. Press Ctrl+C to stop.');
        watchFn(function(ev, callback){
          var oldList = Object.keys(route.list());
          generate({watch: true}, function(err, cache){
            var newList = Object.keys(route.list());

            oldList.forEach(function(item){
              if (newList.indexOf(item) === -1) route.destroy(item);
            });

            process(cache, callback);
          });
        });
      } else {
        var finish = new Date(),
          elapsed = (finish.getTime() - start.getTime()) / 1000;
        console.log('Site generated in %ss.', elapsed.toFixed(3));
        hexo.emit('generateAfter');
        if (deploy){
          spawn({
            command: hexo.core_dir + 'bin/hexo',
            args: ['deploy']
          });
        }
      }
    });
  });
});