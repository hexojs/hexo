var _ = require('lodash');
var pathFn = require('path');
var tildify = require('tildify');
var Theme = require('../theme');
var Source = require('./source');
var fs = require('hexo-fs');
var chalk = require('chalk');

var sep = pathFn.sep;

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

    ctx.log.debug('Config loaded: %s', chalk.magenta(tildify(configPath)));

    config = _.extend(ctx.config, config);
    ctx.config_path = configPath;
    ctx.env.init = true;

    config.root = config.root.replace(/\/*$/, '/');
    config.url = config.url.replace(/\/+$/, '');

    ctx.public_dir = pathFn.resolve(baseDir, config.public_dir) + sep;
    ctx.source_dir = pathFn.resolve(baseDir, config.source_dir) + sep;
    ctx.source = new Source(ctx);

    if (!ctx.theme) return;

    ctx.theme_dir = pathFn.join(baseDir, 'themes', config.theme) + sep;
    ctx.theme_script_dir = pathFn.join(ctx.theme_dir, 'scripts') + sep;
    ctx.theme = new Theme(ctx);
  });
};