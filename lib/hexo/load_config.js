var _ = require('lodash');
var pathFn = require('path');
var tildify = require('tildify');
var util = require('../util');
var Theme = require('../theme');
var Source = require('./source');
var fs = util.fs;

require('colors');

module.exports = function(ctx){
  var baseDir = ctx.base_dir;
  var configPath = ctx.config_path;
  var extname = pathFn.extname(configPath);
  var dirname = pathFn.dirname(configPath);
  var basename = pathFn.basename(configPath, extname);

  return fs.readdir(dirname).filter(function(item){
    return item.substring(0, basename.length) === basename;
  }).then(function(result){
    if (!result.length) return;

    configPath = pathFn.join(pathFn.dirname(configPath), result[0]);

    return ctx.render.render({path: configPath});
  }).then(function(config){
    if (!config) return;

    ctx.log.debug('Config loaded: %s', tildify(configPath).magenta);

    config = _.extend(ctx.config, config);
    ctx.config_path = configPath;
    ctx.env.init = true;

    if (_.last(config.root) !== '/'){
      config.root += '/';
    }

    if (_.last(config.url) === '/'){
      config.url = config.url.substring(0, config.url.length - 1);
    }

    ctx.public_dir = pathFn.join(baseDir, config.public_dir) + pathFn.sep;
    ctx.source_dir = pathFn.join(baseDir, config.source_dir) + pathFn.sep;

    ctx.source = new Source(ctx);

    if (config.theme){
      ctx.theme_dir = pathFn.join(baseDir, 'themes', config.theme) + pathFn.sep;
      ctx.theme_script_dir = pathFn.join(ctx.theme_dir, 'scripts') + pathFn.sep;

      ctx.theme = new Theme(ctx);
    } else {
      throw new Error('Theme has not been set. Please set the theme in _config.yml.');
    }
  });
};