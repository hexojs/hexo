var _ = require('lodash');
var pathFn = require('path');
var tildify = require('tildify');
var Theme = require('../theme');
var Source = require('./source');
var fs = require('hexo-fs');

require('colors');

module.exports = function(ctx){
  var baseDir = ctx.base_dir;
  var configPath = ctx.config_path;
  var extname = pathFn.extname(configPath);
  var dirname = pathFn.dirname(configPath);
  var basename = pathFn.basename(configPath, extname);

  return fs.readdir(dirname).then(function(files){
    var item = '';

    for (var i = 0, len = files.length; i < len; i++){
      item = files[i];

      if (item.substring(0, basename.length) === basename){
        configPath = pathFn.join(dirname, item);
        return ctx.render.render({path: configPath});
      }
    }
  }).then(function(config){
    if (!config) return;

    ctx.log.debug('Config loaded: %s', tildify(configPath).magenta);

    config = _.extend(ctx.config, config);
    ctx.config_path = configPath;
    ctx.env.init = true;

    if (!config.theme){
      throw new Error('Theme has not been set. Please set the theme in _config.yml.');
    }

    config.root = config.root.replace(/\/*$/, '/');
    config.url = config.url.replace(/\/+$/, '');

    ctx.public_dir = pathFn.resolve(baseDir, config.public_dir) + pathFn.sep;
    ctx.source_dir = pathFn.resolve(baseDir, config.source_dir) + pathFn.sep;

    ctx.source = new Source(ctx);

    ctx.theme_dir = pathFn.join(baseDir, 'themes', config.theme) + pathFn.sep;
    ctx.theme_script_dir = pathFn.join(ctx.theme_dir, 'scripts') + pathFn.sep;

    ctx.theme = new Theme(ctx);

    return fs.exists(ctx.theme_dir).then(function(exist){
      if (!exist) throw new Error('Theme "' + config.theme + '" does not exist.');
    });
  });
};