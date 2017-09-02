'use strict';

var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');
var chalk = require('chalk');

module.exports = function(ctx) {
  if (!ctx.env.init || ctx.env.safe) return;

  return loadModules(ctx).then(function() {
    return loadScripts(ctx);
  });
};

function loadModuleList(ctx) {
  if (ctx.config && Array.isArray(ctx.config.plugins)) {
    return Promise.resolve(ctx.config.plugins).filter(function(item) {
      return typeof item === 'string';
    });
  }

  var packagePath = pathFn.join(ctx.base_dir, 'package.json');
  var pluginDir = ctx.plugin_dir;

  // Make sure package.json exists
  return fs.exists(packagePath).then(function(exist) {
    if (!exist) return [];

    // Read package.json and find dependencies
    return fs.readFile(packagePath).then(function(content) {
      var json = JSON.parse(content);
      var deps = json.dependencies || json.devDependencies || {};

      return Object.keys(deps);
    });
  }).filter(function(name) {
    // Ignore plugins whose name is not started with "hexo-"
    if (!/^hexo-|^@[^/]+\/hexo-/.test(name)) return false;

    // Make sure the plugin exists
    var path = pathFn.join(pluginDir, name);
    return fs.exists(path);
  });
}

function loadModules(ctx) {
  var pluginDir = ctx.plugin_dir;

  return loadModuleList(ctx).map(function(name) {
    var path = require.resolve(pathFn.join(pluginDir, name));

    // Load plugins
    return ctx.loadPlugin(path).then(function() {
      ctx.log.debug('Plugin loaded: %s', chalk.magenta(name));
    }).catch(function(err) {
      ctx.log.error({err: err}, 'Plugin load failed: %s', chalk.magenta(name));
    });
  });
}

function loadScripts(ctx) {
  var baseDirLength = ctx.base_dir.length;

  function displayPath(path) {
    return chalk.magenta(path.substring(baseDirLength));
  }

  return Promise.filter([
    ctx.theme_script_dir,
    ctx.script_dir
  ], function(scriptDir) {
    // Ignore the directory if it does not exist
    return scriptDir ? fs.exists(scriptDir) : false;
  }).map(function(scriptDir) {
    return fs.listDir(scriptDir).map(function(name) {
      var path = pathFn.join(scriptDir, name);

      return ctx.loadPlugin(path).then(function() {
        ctx.log.debug('Script loaded: %s', displayPath(path));
      }).catch(function(err) {
        ctx.log.error({err: err}, 'Script load failed: %s', displayPath(path));
      });
    });
  });
}
