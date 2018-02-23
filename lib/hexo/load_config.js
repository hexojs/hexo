'use strict';

const _ = require('lodash');
const pathFn = require('path');
const tildify = require('tildify');
const Theme = require('../theme');
const Source = require('./source');
const fs = require('hexo-fs');
const chalk = require('chalk');

const sep = pathFn.sep;

module.exports = ctx => {
  if (!ctx.env.init) return;

  const baseDir = ctx.base_dir;
  let configPath = ctx.config_path;

  return fs.exists(configPath).then(exist => {
    return exist ? configPath : findConfigPath(configPath);
  }).then(path => {
    if (!path) return;

    configPath = path;
    return ctx.render.render({path});
  }).then(config => {
    if (!config || typeof config !== 'object') return;

    ctx.log.debug('Config loaded: %s', chalk.magenta(tildify(configPath)));

    config = _.merge(ctx.config, config);
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

function findConfigPath(path) {
  const extname = pathFn.extname(path);
  const dirname = pathFn.dirname(path);
  const basename = pathFn.basename(path, extname);

  return fs.readdir(dirname).then(files => {
    let item = '';

    for (let i = 0, len = files.length; i < len; i++) {
      item = files[i];

      if (item.substring(0, basename.length) === basename) {
        return pathFn.join(dirname, item);
      }
    }
  });
}
