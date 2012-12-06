var async = require('async'),
  extend = require('../extend'),
  generator = extend.generator.list(),
  processor = extend.processor.list(),
  helper = extend.helper.list(),
  renderer = Object.keys(extend.renderer.list()),
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
  var start = new Date(),
    ignoreTheme = false,
    ignoreList = [],
    publicExist = false;

  if (_.indexOf(args, '-t') !== -1 || _.indexOf(args, '--theme') !== -1) ignoreTheme = true;

  async.series([
    // Load theme config
    function(next){
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
    function(next){
      fs.exists(publicDir, function(exist){
        if (exist) publicExist = exist;
        next();
      });
    },
    // Install theme assets & Load theme layout
    function(next){
      if (!ignoreTheme || !publicExist) console.log('Installing theme.');

      file.dir(themeDir, function(files){
        async.forEach(files, function(item, next){
          var extname = path.extname(item),
            dirs = item.split(path.sep);

          _.each(dirs, function(item){
            var front = item.substring(0, 1);
            if (front === '_' || front === '.') next();
          });

          var firstDir = dirs.shift();

          switch (firstDir){
            case 'source':
              ignoreList.push(item);

              if (ignoreTheme && publicExist){
                next();
              } else {
                if (_.indexOf(renderer, extname.substring(1)) !== -1){
                  render.compile(themeDir + item, function(err, result, output){
                    if (err) throw err;
                    var filename = dirs.join('/').replace(extname, '.' + output);
                    file.write(publicDir + filename, result, next);
                  });
                } else {
                  file.copy(themeDir + item, publicDir + dirs.join('/'), next);
                }
              }

              break;

            case 'layout':
              file.read(themeDir + item, function(err, content){
                if (err) throw err;

                var filename = path.basename(item, extname);
                layoutCache[filename] = yfm(content);
                layoutCache[filename].source = themeDir + item;
                next();
              });

              break;

            default:
              next();
          }
        }, next);
      });
    },
    function(next){
      if (publicExist){
        console.log('Clearing.');
        file.empty(publicDir, ignoreList, next);
      } else {
        next();
      }
    },
    function(next){
      async.forEachSeries(processor, function(item, next){
        item(site, function(err, locals){
          if (err) throw err;
          if (locals) site = locals;
          next();
        });
      }, next);
    }
  ], function(err){
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
      var finish = new Date();
      console.log('Site generated in %ds.', (finish.getTime() - start.getTime()) / 1000);
    });
  });
});