'use strict';

const { join } = require('path');
const { exists, readFile, listDir } = require('hexo-fs');
const Promise = require('bluebird');
const { magenta } = require('chalk');

module.exports = ctx => {
  if (!ctx.env.init || ctx.env.safe) return;

  return loadModules(ctx).then(() => loadScripts(ctx));
};

function loadModuleList(ctx) {
  let customThemeName;

  if (ctx.config) {
    const { theme } = ctx.config;

    if (theme) {
      customThemeName = String(theme);
    }
  }

  const packagePath = join(ctx.base_dir, 'package.json');

  // Make sure package.json exists
  return exists(packagePath).then(exist => {
    if (!exist) return [];

    // Read package.json and find dependencies
    return readFile(packagePath).then(content => {
      const json = JSON.parse(content);
      const deps = Object.keys(json.dependencies || {});
      const devDeps = Object.keys(json.devDependencies || {});

      return deps.concat(devDeps);
    });
  }).filter(name => {
    // Ignore plugin whose name endswith "hexo-theme-[ctx.config.theme]"
    if (name.endsWith(`hexo-theme-${customThemeName}`)) return false;

    // Ignore plugins whose name is not started with "hexo-"
    if (!/^hexo-|^@[^/]+\/hexo-/.test(name)) return false;

    // Ignore typescript definition file that is started with "@types/"
    if (name.startsWith('@types/')) return false;

    // Make sure the plugin exists
    const path = ctx.resolvePlugin(name);
    return exists(path);
  });
}

function loadModules(ctx) {
  return loadModuleList(ctx).map(name => {
    const path = ctx.resolvePlugin(name);

    // Load plugins
    return ctx.loadPlugin(path).then(() => {
      ctx.log.debug('Plugin loaded: %s', magenta(name));
    }).catch(err => {
      ctx.log.error({err}, 'Plugin load failed: %s', magenta(name));
    });
  });
}

function loadScripts(ctx) {
  const baseDirLength = ctx.base_dir.length;

  function displayPath(path) {
    return magenta(path.substring(baseDirLength));
  }

  return Promise.filter([
    ctx.theme_script_dir,
    ctx.script_dir
  ], scriptDir => { // Ignore the directory if it does not exist
    return scriptDir ? exists(scriptDir) : false;
  }).map(scriptDir => listDir(scriptDir).map(name => {
    const path = join(scriptDir, name);

    return ctx.loadPlugin(path).then(() => {
      ctx.log.debug('Script loaded: %s', displayPath(path));
    }).catch(err => {
      ctx.log.error({err}, 'Script load failed: %s', displayPath(path));
    });
  }));
}
