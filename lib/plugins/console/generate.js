var extend = require('../../extend'),
  generate = require('../../generate'),
  route = require('../../route'),
  call = require('../../call'),
  util = require('../../util'),
  file = util.file,
  async = require('async'),
  fs = require('graceful-fs'),
  _ = require('lodash'),
  term = require('term'),
  config = hexo.config,
  publicDir = hexo.public_dir,
  sourceDir = hexo.source_dir,
  maxOpenFile = config.max_open_file;

extend.console.register('generate', 'Generate static files', function(args, callback){
  var watch = args.w || args.watch ? true : false,
    deploy = args.d || args.deploy ? true : false,
    start = new Date(),
    cache = {};

  console.log('Loading.');
  hexo.emit('generateBefore');

  generate({watch: watch}, function(){
    var list = route.list(),
      keys = Object.keys(list);

    async.auto({
      // Check if public folder exists
      exist: function(next){
        fs.exists(publicDir, function(exist){
          next(null, exist);
        });
      },
      // Add the files to the list
      list: ['exist', function(next, results){
        var exist = results.exist;

        // Scan existed files
        if (exist){
          var arr = [];
          async.forEach(keys, function(i, next){
            var item = list[i];

            // Check whether the file exists if the item is latest
            if (item.latest){
              fs.exists(publicDir + i, function(exist){
                if (!exist) arr.push(i);
                next();
              });
            } else {
              arr.push(i);
              next();
            }
          }, function(){
            next(null, arr);
          })
        } else {
          next(null, keys);
        }
      }],
      // Clear public folder
      clear: ['exist', function(next, results){
        if (results.exist){
          file.empty(publicDir, keys, next);
        } else {
          next();
        }
      }],
      // Generate files
      generate: ['list', function(next, results){
        var arr = results.list,
          total = arr.length,
          now = 1;

        var queue = async.queue(function(i, next){
          list[i](function(err, result){
            if (err) throw new Error('Generate error: ' + i);

            var target = publicDir + i;

            if (result.readable){
              file.copy(result.path, target, next);
            } else {
              cache[i] = result;
              file.write(target, result, next);
            }
          });
        }, maxOpenFile);

        queue.push(arr, function(err){
          var item = this.data;
          if (err) throw new Error('Generate error: ' + item);

          var txt = 'Generating: ' + (now / total * 100).toFixed(2) + '% (' + now++ + '/' + total + ') ';
          if ((txt + item).length > term.width){
            txt += (item.substring(0, term.width - txt.length - 1) + '…').blackBright;
          } else {
            txt += item.blackBright;
          }
          term.clearLine().move(0).write(txt);
        });

        queue.drain = function(){
          term.clearLine().move(0).write('Generated compeletely.\n');
          next();
        };
      }]
    }, function(){
      var finish = new Date(),
        elapsed = (finish.getTime() - start.getTime()) / 1000;

      hexo.emit('generateAfter');
      console.log('Site gnerated in %ss.', elapsed.toFixed(3));

      if (watch){
        console.log('Hexo is watching file changes. Press Ctrl+C to stop.');
        route.on('update', function(path, fn){
          if (!fn.latest){
            fn(function(err, result){
              if (err) throw new Error('Generate error: ' + i);

              var target = publicDir + path;

              var done = function(){
                console.log('%s  %s', 'updated'.green.bold, path);
              };

              if (result.readable){
                file.copy(result.path, target, done);
              } else {
                if (cache[path] !== result){
                  cache[path] = result;
                  file.write(target, result, done);
                }
              }
            });
          }
        }).on('remove', function(path){
          var target = publicDir + path;
          fs.unlink(target, function(){
            console.log('%s  %s', 'deleted'.blackBright.bold, path);
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