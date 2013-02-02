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
  maxOpenFile = config && config.max_open_file ? config.max_open_file : 100,
  cache = {};

var processFn = function(list, callback){
  var arr = route.list(),
    keys = Object.keys(arr),
    total = keys.length,
    now = 1;

  if (!keys.length){
    console.log('Everything is up to date. You can add %s option to rebuild the site.', '-r/--rebuild'.bold);
    return callback();
  }

  async.parallel([
    function(next){
      fs.exists(publicDir, function(exist){
        if (!exist) return next();
        file.empty(publicDir, keys.concat(hexo.cache.assets), next);
      })
    },
    function(next){
      var queue = async.queue(function(i, next){
        arr[i](function(err, result){
          if (err) throw new Error('Generate Error: ' + key);

          if (list){
            var txt = '  create   ',
              process = '(' + now++ + '/' + total + ')';
              name = '';

            if (i.length + txt.length > term.width - process.length - 1){
              name += i.substring(0, term.width - txt.length - process.length - 2) + '…';
            } else {
              name += i;
            }

            term.write(txt.green.bold + name).move(-process.length).write(process.blackBright + '\n');
          } else {
            var txt = 'Generating. ' + (now / total * 100).toFixed(2) + '% (' + now++ + '/' + total + ') ';
            if ((txt + i).length > term.width){
              txt += (i.substring(0, term.width - txt.length - 1) + '…').grey;
            } else {
              txt += i.blackBright;
            }

            term.clearLine().move(0).write(txt);
          }

          if (result.readable){
            file.copy(result.path, publicDir + i, next);
          } else {
            file.write(publicDir + i, result, next);
          }
        });
      }, maxOpenFile);

      queue.push(keys, function(err){
        if (err) throw err;
      });

      queue.drain = function(){
        if (!list){
          term.clearLine().move(0).write('Generated compeletely.\n');
        }
        next();
      };
    }
  ], callback);
};

extend.console.register('generate', 'Generate static files', function(args){
  var generate = require('../../generate'),
    watch = args.w || args.watch ? true : false,
    deploy = (args.d || args.deploy) && !watch ? true : false,
    list = args.l || args.list ? true : false,
    rebuild = args.r || args.rebuild ? true : false,
    start = new Date();

  console.log('Loading.');
  hexo.emit('generateBefore');

  generate({watch: watch, rebuild: rebuild}, function(){
    processFn(list, function(){
      var finish = new Date(),
        elapsed = (finish.getTime() - start.getTime()) / 1000;

      console.log('Site generated in %ss.', elapsed.toFixed(3));

      if (deploy){
        spawn({
          command: hexo.core_dir + 'bin/hexo',
          args: ['deploy']
        });
      } else {
        process.exit();
      }
    });
  });
});