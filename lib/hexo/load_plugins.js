'use strict';

const pathFn = require('path');
const fs = require('hexo-fs');
const Promise = require('bluebird');
const chalk = require('chalk');

module.exports = ctx => {
  if (!ctx.env.init || ctx.env.safe) return;

  return loadModules(ctx).then(() => loadScripts(ctx));
};

function loadModuleList(ctx) {
  if (ctx.config && Array.isArray(ctx.config.plugins)) {
    return Promise.resolve(ctx.config.plugins).filter(item => typeof item === 'string');
  }

  const packagePath = pathFn.join(ctx.base_dir, 'package.json');

  // Make sure package.json exists
  return fs.exists(packagePath).then(exist => {
    if (!exist) return [];

    // Read package.json and find dependencies
    return fs.readFile(packagePath).then(content => {
      const json = JSON.parse(content);
      const deps = Object.keys(json.dependencies || {});
      const devDeps = Object.keys(json.devDependencies || {});

      return deps.concat(devDeps);
    });
  }).filter(name => {
    // Ignore plugins whose name is not started with "hexo-"
    if (!/^hexo-|^@[^/]+\/hexo-/.test(name)) return false;

    // Make sure the plugin exists
    const path = ctx.resolvePlugin(name);
    return fs.exists(path);
  });
}

function loadModules(ctx) {
  return loadModuleList(ctx).map(name => {
    const path = ctx.resolvePlugin(name);

    // Load plugins
    return ctx.loadPlugin(path).then(() => {
      ctx.log.debug('Plugin loaded: %s', chalk.magenta(name));
    }).catch(err => {
      ctx.log.error({err}, 'Plugin load failed: %s', chalk.magenta(name));
    });
  });
}

function loadScripts(ctx) {
  const baseDirLength = ctx.base_dir.length;

  function displayPath(path) {
    return chalk.magenta(path.substring(baseDirLength));
  }

  return Promise.filter([
    ctx.theme_script_dir,
    ctx.script_dir
  ], scriptDir => { // Ignore the directory if it does not exist
    return scriptDir ? fs.exists(scriptDir) : false;
  }).map(scriptDir => fs.listDir(scriptDir).map(name => {
    const path = pathFn.join(scriptDir, name);

    return ctx.loadPlugin(path).then(() => {
      ctx.log.debug('Script loaded: %s', displayPath(path));
    }).catch(err => {
      ctx.log.error({err}, 'Script load failed: %s', displayPath(path));
    });
  }));
}
