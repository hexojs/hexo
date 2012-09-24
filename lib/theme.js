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

exports.asset = function(callback){
  var themeDir = __dirname + '/../themes/' + config.theme;

  async.parallel([
    function(next){
      file.dir(themeDir + '/css', function(files){
        async.forEach(files, function(item, next){
          var extname = path.extname(item),
            filename = path.basename(item, extname),
            dirname = path.dirname(item),
            target = __dirname + '/../public/css/' + dirname + '/' + filename + '.css';

          switch (extname){
            case '.styl':
            case '.less':
            case '.sass':
            case '.scss':
              file.read(themeDir + '/css/' + item, function(err, result){
                switch (extname){
                  case '.styl':
                    stylus(result).use(nib()).set('filename', themeDir + '/css/' + item).render(function(err, css){
                      if (err) throw err;
                      file.write(target, css, next);
                    });

                    break;

                  case '.less':
                    less.render(result, function(err, css){
                      if (err) throw err;
                      file.write(target, css, next);
                    });

                    break;

                  case '.sass':
                  case '.scss':
                    sass.render(result, function(err, css){
                      if (err) throw err;
                      file.write(target, css, next);
                    });

                    break;
                }
              });

              break;

            default:
              if (item.substring(0, 1) === '_'){
                next(null);
              } else {
                file.copy(themeDir + '/css/' + item, __dirname + '/../public/css/' + item);
                next(null);
              }

              break;
          }
        }, next);
      });
    },
    function(next){
      file.dir(themeDir + '/js', function(files){
        async.forEach(files, function(item, next){
          var extname = path.extname(item),
            filename = path.basename(item, extname),
            dirname = path.dirname(item),
            target = __dirname + '/../public/js/' + dirname + '/' + filename + '.js';

          switch (extname){
            case '.coffee':
              file.read(themeDir + '/js/' + item, function(result){
                file.write(target, coffee.compile(result), next);
              });
              break;

            default:
              if (item.substring(0, 1) === '_'){
                next(null);
              } else {
                file.copy(themeDir + '/js/' + item, __dirname + '/../public/js/' + item);
                next(null);
              }

              break;
          }
        });
      });
    },
    function(next){
      file.dir(themeDir + '/assets', function(files){
        async.forEach(files, function(item, next){
          file.copy(themeDir + '/assets/' + item, __dirname + '/../public/assets/' + item);
          next(null);
        }, next);
      });
    }
  ], function(){
    log.info('Theme installed.')
    callback();
  });
};

var data = exports.config = new function(){
  return {
    init: function(callback){
      file.read(__dirname + '/../themes/' + config.theme + '/config.yml', function(err, file){
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