var config = require('./config'),
  file = require('./file'),
  log = require('./log'),
  yfm = require('./yaml-front-matter'),
  async = require('async'),
  fs = require('graceful-fs'),
  path = require('path'),
  stylus = require('stylus'),
  nib = require('nib'),
  less = require('less'),
  sass = require('node-sass'),
  coffee = require('coffee-script'),
  ejs = require('ejs'),
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

var getLayout = function(source, callback){
  var extname = path.extname(source),
    filename = path.basename(source, extname);

  file.read(source, function(err, file){
    if (err) throw err;

    var meta = yfm(file);

    layout.__defineGetter__(filename, function(){
      if (meta.layout){
        return ejs.render(layout[meta.layout], {body: meta._content});
      } else {
        return file;
      }
    });

    callback();
  });
};

var layout = exports.layout = new function(){
  return {
    init: function(callback){
      var themeDir = __dirname + '/../themes/' + config.theme;

      async.series([
        // Read default layout
        function(next){
          file.read(themeDir + '/layout/default.html', function(err, file){
            if (err) throw err;
            layout.__defineGetter__('default', function(){
              return file;
            });
            next(null);
          });
        },
        // Read other layouts
        function(next){
          file.dir(themeDir + '/layout', function(files){
            async.forEach(files, function(item, next){
              if (item === 'default.html'){
                next(null);
              } else {
                getLayout(themeDir + '/layout/' + item, next);
              }
            }, next);
          });
        },
        // Read index template
        function(next){
          getLayout(themeDir + '/index.html', next);
        },
        // Read other templates
        function(next){
          var arr = ['archive', 'category', 'tag'];

          async.forEach(arr, function(item, next){
            fs.exists(themeDir + '/' + item + '.html', function(exist){
              if (exist){
                getLayout(themeDir + '/' + item + '.html', next);
              } else {
                layout.__defineGetter__(item, function(){
                  return layout.index;
                });

                next(null);
              }
            });
          }, next);
        },
        // Read atom template
        function(next){
          file.read(themeDir + '/atom.xml', function(err, file){
            if (err) throw err;
            layout.__defineGetter__('atom', function(){
              return file;
            });
            next(null);
          });
        }
      ], function(){
        log.info('Theme layout loaded.');
        callback();
      });
    }
  }
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