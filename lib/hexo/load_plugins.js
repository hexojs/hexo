var pathFn = require('path');
var fs = require('hexo-fs');
var tildify = require('tildify');
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
  var pluginDir = ctx.plugin_dir;

  return fs.exists(pluginDir).then(function(exist){
    return exist ? fs.readdir(pluginDir) : [];
  }).filter(function(name){
    return name.slice(0, 5) === 'hexo-';
  }).map(function(name){
    var path = require.resolve(pathFn.join(pluginDir, name));

    return runInContext(ctx, path).then(function(){
      ctx.log.debug('Plugin loaded: %s', chalk.magenta(name));
    }, function(err){
      ctx.log.error({err: err}, 'Plugin load failed: %s', chalk.magenta(name));
    });
  });
}

function loadScripts(ctx){
  return Promise.filter([
    ctx.script_dir,
    ctx.theme_script_dir
  ], function(scriptDir){
    return scriptDir ? fs.exists(scriptDir) : false;
  }).map(function(scriptDir){
    var path = '';

    return fs.listDir(scriptDir).map(function(name){
      path = pathFn.join(scriptDir, name);
      return runInContext(ctx, path);
    }).then(function(){
      ctx.log.debug('Script loaded: %s', chalk.magenta(tildify(path)));
    }, function(err){
      ctx.log.error({err: err}, 'Script load failed: %s', chalk.magenta(tildify(path)));
    });
  });
}