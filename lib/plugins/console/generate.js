var async = require('async'),
  colors = require('colors'),
  fs = require('graceful-fs'),
  path = require('path'),
  _ = require('underscore'),
  extend = require('../../extend'),
  route = require('../../route'),
  util = require('../../util'),
  file = util.file,
  stdout = hexo.process.stdout,
  publicDir = hexo.public_dir,
  sourceDir = hexo.source_dir;

extend.console.register('generate', 'Generate static files', function(args){
  var generate = require('../../generate'),
    start = new Date();

  console.log('Loading.');
  hexo.emit('generateBefore');

  generate({}, function(){
    var list = route.list(),
      keys = Object.keys(list),
      width = stdout.getWindowSize()[0],
      total = keys.length,
      now = 1;

    stdout.write('Generating.');

    var queue = async.queue(function(i, next){
      list[i](function(err, result){
        if (err) throw new Error('Generate Error: ' + key);

        var process = 'Generating. ' + (now / total * 100).toFixed(2) + '% (' + now++ + '/' + total + ') ';
        if ((process + i).length > width){
          process += (i.substring(0, width - process.length - 1) + '…').grey;
        } else {
          process += i.grey;
        }

        stdout.clearLine();
        stdout.cursorTo(0);
        stdout.write(process);

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
    }, 100);

    queue.push(keys, function(err){
      if (err) throw err;
    });

    queue.drain = function(){
      stdout.clearLine();
      stdout.cursorTo(0);
      stdout.write('Generated compeletely.\n');

      var finish = new Date(),
        elapsed = (finish.getTime() - start.getTime()) / 1000;

      console.log('Site generated in %ss.', elapsed.toFixed(3));
    };
  });
});