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
  themeDir = hexo.theme_dir,
  urlConfig = config.url,
  rootConfig = config.root,
  _ = require('underscore');

var freeze = function(obj){
  var result = {};

  _.each(obj, function(val, key){
    result.__defineGetter__(key, function(){
      return val;
    });
  });

  Object.freeze(result);

  return result;
};

module.exports = function(options, callback){
  var theme = require('./theme'),
    themeRender = theme.render,
    preview = options.preview,
    ignore = options.ignore,
    publicExist = false,
    themeConfig = {},
    themei18n;

  var process = function(callback){
    var site = {};

    async.forEachSeries(processor, function(item, next){
      item(site, function(err, locals){
        if (err) throw err;
        if (locals) site = locals;
        next();
      });
    }, function(){
      callback(null, site);
    });
  };

  var generate = function(site, callback){
    var site = freeze(site);

    async.forEach(generator, function(item, next){
      item(site, function(layout, locals){
        var newLocals = {
          page: locals,
          site: site,
          config: config,
          theme: themeConfig,
          __: themei18n
        };

        return themeRender(layout, newLocals);
      }, next);
    }, callback);
  };

  async.auto({
    load: function(next){
      fs.exists(themeDir + '_config.yml', function(exist){
        if (exist){
          render.compile(themeDir + '_config.yml', function(err, result){
            if (err) throw new Error('Failed to load theme config');
            themeConfig = freeze(result);
            next();
          });
        } else {
          next();
        }
      });
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
      theme.i18n(function(err, result){
        if (err) throw new Error('Failed to theme i18n');
        if (result) themei18n = result.get;
        next();
      });
    },
    theme_source: ['check', 'cache', function(next){
      if (ignore && publicExist) return next();
      theme.source(next);
    }],
    process: function(next){
      process(next);
    },
    generate: ['load', 'theme_layout', 'process', function(next, results){
      generate(results.process, next);
    }]
  }, function(err, results){
    callback(err, ignore ? results.cache.theme : results.theme_source);
  });
};