var extend = require('./extend'),
  generator = extend.generator.list(),
  processor = extend.processor.list(),
  render = require('./render'),
  util = require('./util'),
  file = util.file,
  async = require('async'),
  fs = require('fs'),
  config = hexo.config,
  baseDir = hexo.base_dir,
  publicDir = hexo.public_dir,
  themeDir = hexo.theme_dir;

module.exports = function(options, callback){
  var theme = require('./theme'),
    preview = options.preview,
    ignore = options.ignore,
    publicExist = false;

  async.auto({
    load: function(next){
      render.compile(themeDir + '_config.yml', next);
    },
    check: function(next){
      if (preview) return next();

      fs.exists(publicDir, function(exist){
        publicExist = exist;
        next();
      });
    },
    cache: ['check', function(next){
      if (ignore && publicExist && !preview){
        fs.exists(baseDir + '.cache', function(exist){
          if (exist){
            file.read(baseDir + '.cache', function(err, content){
              next(null, JSON.parse(content));
            });
          } else {
            ignore = false;
            next();
          }
        });
      } else {
        next();
      }
    }],
    theme_layout: function(next){
      theme.layout(next);
    },
    theme_i18n: function(next){
      theme.i18n(next);
    },
    theme_source: ['check', 'cache', function(next){
      if (ignore && publicExist) return next();
      theme.source(next);
    }],
    process: function(next){
      var site = {};

      async.forEachSeries(processor, function(item, next){
        item(site, function(err, locals){
          if (err) throw err;
          if (locals) site = locals;
          next();
        });
      }, function(){
        next(null, site);
      });
    },
    generate: ['load', 'theme_layout', 'process', function(next, results){
      var site = results.process,
        themeConfig = results.load[0],
        i18n = results.theme_i18n ? results.theme_i18n.get : null,
        themeRender = theme.render;

      async.forEach(generator, function(item, next){
        item(site, function(layout, locals){
          var newLocals = {
            page: locals,
            site: site,
            config: config,
            theme: themeConfig,
            __: i18n
          };

          return themeRender(layout, newLocals);
        }, next);
      }, next);
    }]
  }, function(err, results){
    callback(err, ignore ? results.cache.theme : results.theme_source);
  });
};