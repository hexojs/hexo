var config = require('./config'),
  file = require('./file'),
  log = require('./log'),
  async = require('async'),
  fs = require('graceful-fs'),
  path = require('path'),
  stylus = require('stylus'),
  nib = require('nib'),
  less = require('less'),
  sass = require('node-sass'),
  coffee = require('coffee-script'),
  yaml = require('yamljs');

var read = function(source, destination, callback){
  fs.readdir(source, function(err, files){
    if (err) throw err;

    async.forEach(files, function(item, next){
      var extname = path.extname(item),
        filename = path.basename(item, extname);

      switch (extname){
        case '.css':
        case '.js':
        case '.styl':
        case '.less':
        case '.sass':
        case '.scss':
        case '.coffee':
          fs.readFile(source + '/' + item, 'utf8', function(err, result){
            if (err) throw err;

            switch (extname){
              case '.styl':
                stylus(result).use(nib()).set('filename', source).render(function(err, css){
                  if (err) throw err;
                  file.write(destination + '/' + filename + '.css', css, next);
                });

                break;

              case '.less':
                less.render(result, function(err, css){
                  if (err) throw err;
                  file.write(destination + '/' + filename + '.css', css, next);
                });

                break;

              case '.sass':
              case '.scss':
                sass.render(result, function(err, css){
                  if (err) throw err;
                  file.write(destination + '/' + filename + '.css', css, next);
                });
                break;

              case '.coffee':
                file.write(destination + '/' + filename + '.js', coffee.compile(result), next);
                break;

              default:
                file.write(destination + '/' + item, result, next);
                break;
            }
          });

          break;

        case '':
          fs.stat(source + '/' + item, function(err, stats){
            if (err) throw err;

            if (stats.isDirectory()){
              read(source + '/' + item, destination + '/' + item, next);
            } else {
              next(null);
            }
          });

          break;

        default:
          next(null);
          break;
      }
    }, callback);
  });
};

exports.asset = function(callback){
  async.auto({
    css: function(next){
      read(__dirname + '/../themes/' + config.theme + '/css', __dirname + '/../public/css', next);
    },
    js: function(next){
      read(__dirname + '/../themes/' + config.theme + '/js', __dirname + '/../public/js', next);
    },
    done: ['css', 'js', function(next){
      log.info('Theme installed.');
      callback();
    }]
  });
};

var data = exports.config = new function(){
  return {
    init: function(callback){
      fs.readFile(__dirname + '/../themes/' + config.theme + '/config.yml', 'utf8', function(err, file){
        if (err) throw err;

        var settings = yaml.parse(file);

        for (var i in settings){
          (function(i){
            data.__defineGetter__(i, function(){
              return settings[i];
            });
          })(i);
        }

        callback();
      });
    }
  }
};