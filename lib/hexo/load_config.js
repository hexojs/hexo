'use strict';

var _ = require('lodash');
var pathFn = require('path');
var tildify = require('tildify');
var Theme = require('../theme');
var Source = require('./source');
var fs = require('hexo-fs');
var chalk = require('chalk');

var sep = pathFn.sep;

module.exports = function(ctx){
  if (!ctx.env.init) return;

  var baseDir = ctx.base_dir;
  var configPath = ctx.config_path;

  return fs.exists(configPath).then(function(exist){
    return exist ? configPath : findConfigPath(configPath);
  }).then(function(path){
    if (!path) return;

    configPath = path;
    return ctx.render.render({path: path});
  }).then(function(config){
    if (!config || typeof config !== 'object') return;

    ctx.log.debug('Config loaded: %s', chalk.magenta(tildify(configPath)));

    config = _.extend(ctx.config, config);
    ctx.config_path = configPath;

    config.root = config.root.replace(/\/*$/, '/');
    config.url = config.url.replace(/\/+$/, '');

    ctx.public_dir = pathFn.resolve(baseDir, config.public_dir) + sep;
    ctx.source_dir = pathFn.resolve(baseDir, config.source_dir) + sep;
    ctx.source = new Source(ctx);

    if (!config.theme) return;

    config.theme = config.theme.toString();
    ctx.theme_dir = pathFn.join(baseDir, 'themes', config.theme) + sep;
    ctx.theme_script_dir = pathFn.join(ctx.theme_dir, 'scripts') + sep;
    ctx.theme = new Theme(ctx);
  });
};

function findConfigPath(path){
  var extname = pathFn.extname(path);
  var dirname = pathFn.dirname(path);
  var basename = pathFn.basename(path, extname);

  return fs.readdir(dirname).then(function(files){
    var item = '';

    for (var i = 0, len = files.length; i < len; i++){
      item = files[i];

      if (item.substring(0, basename.length) === basename){
        return pathFn.join(dirname, item);
      }
    }
  });
}