var async = require('async'),
  colors = require('colors'),
  fs = require('graceful-fs'),
  path = require('path'),
  _ = require('underscore'),
  extend = require('../../extend'),
  route = require('../../route'),
  util = require('../../util'),
  file = util.file,
  spawn = util.spawn,
  stdout = hexo.process.stdout,
  publicDir = hexo.public_dir,
  sourceDir = hexo.source_dir,
  config = hexo.config,
  maxOpenFile = config && config.max_open_file ? config.max_open_file : 100,
  cache = {};

var process = function(callback){
  var list = route.list(),
    keys = Object.keys(list),
    width = stdout.getWindowSize()[0],
    total = keys.length,
    now = 1;

  stdout.write('Generating.');

  async.parallel([
    function(next){
      fs.exists(publicDir, function(exist){
        if (!exist) return next();
        file.empty(publicDir, keys.concat(hexo.cache.assets), next);
      })
    },
    function(next){
      var queue = async.queue(function(i, next){
        list[i](function(err, result){
          if (err) throw new Error('Generate Error: ' + key);

          var txt = 'Generating. ' + (now / total * 100).toFixed(2) + '% (' + now++ + '/' + total + ') ';
          if ((txt + i).length > width){
            txt += (i.substring(0, width - txt.length - 1) + '…').grey;
          } else {
            txt += i.grey;
          }

          stdout.clearLine();
          stdout.cursorTo(0);
          stdout.write(txt);

          if (result.readable){
            file.copy(result.path, publicDir + i, next);
          } else {
            var dest = publicDir + i,
              parent = path.dirname(dest);

            async.series([
              function(next){
                fs.exists(parent, function(exist){
                  if (exist) next();
                  else file.mkdir(parent, next);
                });
              }
            ], function(){
              var ws = fs.createWriteStream(dest);
              ws.write(result);
              ws.once('drain', next)
                .on('error', function(err){
                  if (err) throw err;
                });
            });
          }
        });
      }, maxOpenFile);

      queue.push(keys, function(err){
        if (err) throw err;
      });

      queue.drain = function(){
        stdout.clearLine();
        stdout.cursorTo(0);
        stdout.write('Generated compeletely.\n');
        callback();
      };
    }
  ]);
};

extend.console.register('generate', 'Generate static files', function(args){
  var generate = require('../../generate'),
    watch = args.w || args.watch ? true : false,
    deploy = (args.d || args.deploy) && !watch ? true : false,
    start = new Date();

  console.log('Loading.');
  hexo.emit('generateBefore');

  generate({watch: watch}, function(){
    process(function(){
      var finish = new Date(),
        elapsed = (finish.getTime() - start.getTime()) / 1000;

      console.log('Site generated in %ss.', elapsed.toFixed(3));

      if (deploy){
        spawn({
          command: hexo.core_dir + 'bin/hexo',
          args: ['deploy']
        });
      }
    });
  });
});