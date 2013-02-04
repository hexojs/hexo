var async = require('async'),
  term = require('term'),
  fs = require('graceful-fs'),
  path = require('path'),
  _ = require('underscore'),
  extend = require('../../extend'),
  route = require('../../route'),
  util = require('../../util'),
  file = util.file,
  spawn = util.spawn,
  publicDir = hexo.public_dir,
  sourceDir = hexo.source_dir,
  config = hexo.config,
  maxOpenFile = config && config.max_open_file ? config.max_open_file : 100;

extend.console.register('generate', 'Generate static files', function(args){
  var generate = require('../../generate'),
    watch = args.w || args.watch ? true : false,
    deploy = (args.d || args.deploy) && !watch ? true : false,
    rebuild = args.r || args.rebuild ? true : false,
    start = new Date();

  console.log('Loading.');
  hexo.emit('generateBefore');

  generate({watch: watch}, function(){
    var list = route.list(),
      keys = Object.keys(list);

    async.waterfall([
      function(next){
        fs.exists(publicDir, function(exist){
          if (exist){
            file.empty(publicDir, keys, function(){
              next(null, true);
            });
          } else {
            next(null, false);
          }
        });
      },
      function(exist, next){
        if (exist && !rebuild){
          var arr = [];
          for (var i=0, len=keys.length; i<len; i++){
            var item = keys[i];
            if (!list[item]._latest) arr.push(item);
          }
        } else {
          var arr = keys;
        }

        var total = arr.length,
          now = 1;

        if (!total){
          console.log('Everything is up to date. You can add %s option to rebuild the site.', '-r/--rebuild'.bold);
          return next();
        }

        var queue = async.queue(function(i, next){
          list[i](function(err, result){
            if (err) throw new Error('Generate Error: ' + key);

            var txt = 'Generating. ' + (now / total * 100).toFixed(2) + '% (' + now++ + '/' + total + ') ';
            if ((txt + i).length > term.width){
              txt += (i.substring(0, term.width - txt.length - 1) + '…').grey;
            } else {
              txt += i.blackBright;
            }
            term.clearLine().move(0).write(txt);

            if (result.readable){
              file.copy(result.path, publicDir + i, next);
            } else {
              file.write(publicDir + i, result, next);
            }
          });
        }, maxOpenFile);

        queue.push(arr, function(err){
          if (err) throw err;
        });

        queue.drain = function(){
          term.clearLine().move(0).write('Generated compeletely.\n');
          next();
        };
      }
    ], function(){
      var finish = new Date(),
        elapsed = (finish.getTime() - start.getTime()) / 1000;

      console.log('Site generated in %ss', elapsed.toFixed(3));
    });
  });
});