var async = require('async'),
  extend = require('../extend'),
  generator = extend.generator.list(),
  processor = extend.processor.list(),
  helper = extend.helper.list(),
  render = require('../render'),
  renderSync = render.renderSync,
  Collection = require('../model').Collection,
  util = require('../util'),
  file = util.file,
  yfm = util.yfm,
  _ = require('underscore'),
  path = require('path'),
  fs = require('fs'),
  config = hexo.config,
  baseDir = hexo.base_dir,
  themeDir = hexo.theme_dir,
  publicDir = hexo.public_dir,
  themeConfig = {},
  layoutCache = {};

var site = {
  posts: new Collection(),
  pages: new Collection()
};

var themeRender = function(template, locals){
  if (!layoutCache[template]) return '';

  var layout = layoutCache[template],
    source = layout.source,
    extname = path.extname(source).substring(1),
    newHelper = _.clone(helper);

  _.each(newHelper, function(val, key){
    newHelper[key] = val(source, layout.content, locals);
  });

  var newLocals = _.extend(locals, newHelper);

  if (layout.layout){
    var content = themeRender(layout.layout, _.extend(locals, {body: layout._content}));
  } else {
    var content = layout._content;
  }

  var result = renderSync(content, extname, newLocals);

  return result;
};

extend.console.register('generate', 'Generate static files', function(args){
  var renderer = Object.keys(extend.renderer.list());

  var start = new Date(),
    ignoreTheme = false,
    ignoreList = [],
    publicExist = false;

  if (_.indexOf(args, '-t') !== -1 || _.indexOf(args, '--theme') !== -1) ignoreTheme = true;

  async.auto({
    // Load theme config
    load: function(next){
      render.compile(themeDir + '_config.yml', function(err, file){
        if (err) throw err;

        if (file){
          _.each(file, function(val, key){
            themeConfig.__defineGetter__(key, function(){
              return val;
            });
          })
        }

        next();
      });
    },
    // Check if public folder exists
    check: function(next){
      fs.exists(publicDir, function(exist){
        if (exist) publicExist = exist;
        next();
      });
    },
    // Load cache
    cache: function(next){
      var cachePath = baseDir + '.cache';

      fs.exists(cachePath, function(exist){
        if (exist){
          file.read(cachePath, function(err, content){
            if (err) throw err;
            if (ignoreTheme && publicExist) ignoreList = JSON.parse(content).theme;
            next();
          });
        } else {
          next();
        }
      });
    },
    // Install theme assets & Load theme layout
    install: ['cache', function(next){
      if (!ignoreTheme || !publicExist) console.log('Installing theme.');

      file.dir(themeDir, function(files){
        async.forEach(files, function(item, next){
          var extname = path.extname(item),
            dirs = item.split(path.sep);

          for (var i=0, len=dirs.length; i<len; i++){
            var front = dirs[i].substr(0, 1);
            if (front === '_' || front === '.') return next();
          }

          switch (dirs.shift()){
            case 'source':
              var filename = item.substring(7, item.length);

              if (ignoreTheme && publicExist) return next();

              if (_.indexOf(renderer, extname.substring(1)) !== -1){
                render.compile(themeDir + item, function(err, result, output){
                  if (err) throw err;
                  var dest = filename.substring(0, filename.length - extname.length) + '.' + output;
                  ignoreList.push(dest);
                  file.write(publicDir + dest, result, next);
                });
              } else {
                ignoreList.push(filename);
                file.copy(themeDir + item, publicDir + filename, next);
              }

              break;

            case 'layout':
              file.read(themeDir + item, function(err, content){
                if (err) throw err;

                var name = item.substring(7, item.length - extname.length);
                layoutCache[name] = yfm(content);
                layoutCache[name].source = themeDir + item;
                next();
              });

              break;

            default:
              next();
          }
        }, next);
      });
    }],
    store: ['install', function(next){
      file.write(baseDir + '.cache', JSON.stringify({theme: ignoreList}), next);
    }],
    clear: ['install', function(next){
      if (publicExist){
        console.log('Clearing.');
        file.empty(publicDir, ignoreList, next);
      } else {
        next();
      }
    }],
    process: ['clear', function(next){
      async.forEachSeries(processor, function(item, next){
        item(site, function(err, locals){
          if (err) throw err;
          if (locals) site = locals;
          next();
        });
      }, next);
    }]
  }, function(err){
    if (err) throw err;

    Object.freeze(site);

    async.forEach(generator, function(item, next){
      item(site, function(layout, locals){
        var newLocals = {
          page: locals,
          site: site,
          config: config,
          theme: themeConfig
        };

        return themeRender(layout, newLocals);
      }, next);
    }, function(){
      var finish = new Date(),
        elapsed = (finish.getTime() - start.getTime()) / 1000;
      console.log('Site generated in %ss.', elapsed.toFixed(3));
    });
  });
});