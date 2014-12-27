var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');
var vm = require('vm');
var Module = require('module');
var chalk = require('chalk');

var pre = '(function(exports, require, module, __filename, __dirname, hexo){';
var post = '});';

module.exports = function(ctx){
  if (!ctx.env.init || ctx.env.safe) return;

  return Promise.all([
    loadModules(ctx),
    loadScripts(ctx)
  ]);
};

function runInContext(ctx, path){
  return fs.readFile(path).then(function(script){
    // Based on: https://github.com/joyent/node/blob/v0.10.33/src/node.js#L516
    var module = new Module(path);
    module.filename = path;
    module.paths = Module._nodeModulePaths(path);

    function require(path){
      return module.require(path);
    }

    require.resolve = function(request){
      return Module._resolveFilename(request, module);
    };

    require.main = process.mainModule;
    require.extensions = Module._extensions;
    require.cache = Module._cache;

    var fn = vm.runInThisContext(pre + script + post, path);

    return fn(module.exports, require, module, path, pathFn.dirname(path), ctx);
  });
}

function loadModules(ctx){
  var packagePath = pathFn.join(ctx.base_dir, 'package.json');
  var pluginDir = ctx.plugin_dir;

  // Make sure package.json exists
  return fs.exists(packagePath).then(function(exist){
    if (!exist) return [];

    // Read package.json and find dependencies
    return fs.readFile(packagePath).then(function(content){
      var json = JSON.parse(content);
      var deps = json.dependencies || {};

      return Object.keys(deps);
    });
  }).filter(function(name){
    // Ignore plugins whose name is not started with "hexo-"
    if (name.slice(0, 5) !== 'hexo-') return false;

    // Make sure the plugin exists
    var path = pathFn.join(pluginDir, name);
    return fs.exists(path);
  }).map(function(name){
    var path = require.resolve(pathFn.join(pluginDir, name));

    // Load plugins
    return runInContext(ctx, path).then(function(){
      ctx.log.debug('Plugin loaded: %s', chalk.magenta(name));
    }, function(err){
      ctx.log.error({err: err}, 'Plugin load failed: %s', chalk.magenta(name));
    });
  });
}

function loadScripts(ctx){
  var baseDirLength = ctx.base_dir.length;

  function displayPath(path){
    return chalk.magenta(path.substring(baseDirLength));
  }

  return Promise.filter([
    ctx.script_dir,
    ctx.theme_script_dir
  ], function(scriptDir){
    // Ignore the directory if it does not exist
    return scriptDir ? fs.exists(scriptDir) : false;
  }).map(function(scriptDir){
    var path = '';

    // List all files in the directory
    return fs.listDir(scriptDir).map(function(name){
      path = pathFn.join(scriptDir, name);
      return runInContext(ctx, path);
    }).then(function(){
      ctx.log.debug('Script loaded: %s', displayPath(path));
    }, function(err){
      ctx.log.error({err: err}, 'Script load failed: %s', displayPath(path));
    });
  });
}