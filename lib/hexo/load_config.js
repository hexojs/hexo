'use strict';

const { sep, resolve, join, parse } = require('path');
const tildify = require('tildify');
const Theme = require('../theme');
const Source = require('./source');
const { exists, readdir } = require('hexo-fs');
const { magenta } = require('chalk');
const { deepMerge } = require('hexo-util');
const validateConfig = require('./validate_config');
const { external_link: externalLinkDefaultCfg } = require('./default_config');

module.exports = async ctx => {
  if (!ctx.env.init) return;

  const baseDir = ctx.base_dir;
  let configPath = ctx.config_path;

  const path = await exists(configPath) ? configPath : await findConfigPath(configPath);
  if (!path) return;
  configPath = path;

  let config = await ctx.render.render({ path });
  if (!config || typeof config !== 'object') return;

  ctx.log.debug('Config loaded: %s', magenta(tildify(configPath)));

  ctx.config = deepMerge(ctx.config, config);
  config = ctx.config;

  validateConfig(ctx);

  ctx.config_path = configPath;
  // Trim multiple trailing '/'
  config.root = config.root.replace(/\/*$/, '/');
  // Remove any trailing '/'
  config.url = config.url.replace(/\/+$/, '');

  // Deprecated: config.external_link boolean option will be removed in future
  if (typeof config.external_link === 'boolean') {
    config.external_link = {
      ...externalLinkDefaultCfg,
      enable: config.external_link
    };
  }

  ctx.public_dir = resolve(baseDir, config.public_dir) + sep;
  ctx.source_dir = resolve(baseDir, config.source_dir) + sep;
  ctx.source = new Source(ctx);

  if (!config.theme) return;

  const theme = config.theme.toString();
  config.theme = theme;

  const themeDirFromThemes = join(baseDir, 'themes', theme) + sep; // base_dir/themes/[config.theme]/
  const themeDirFromNodeModules = join(ctx.plugin_dir, 'hexo-theme-' + theme) + sep; // base_dir/node_modules/hexo-theme-[config.theme]/

  // themeDirFromThemes has higher priority than themeDirFromNodeModules
  let ignored = [];
  if (await exists(themeDirFromThemes)) {
    ctx.theme_dir = themeDirFromThemes;
    ignored = ['**/themes/*/node_modules/**', '**/themes/*/.git/**'];
  } else if (await exists(themeDirFromNodeModules)) {
    ctx.theme_dir = themeDirFromNodeModules;
    ignored = ['**/node_modules/hexo-theme-*/node_modules/**', '**/node_modules/hexo-theme-*/.git/**'];
  }
  ctx.theme_script_dir = join(ctx.theme_dir, 'scripts') + sep;
  ctx.theme = new Theme(ctx, { ignored });

};

async function findConfigPath(path) {
  const { dir, name } = parse(path);

  const files = await readdir(dir);
  const item = files.find(item => item.startsWith(name));
  if (item != null) return join(dir, item);
}
