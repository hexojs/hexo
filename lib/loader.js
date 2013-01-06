var fs = require('graceful-fs'),
  clc = require('cli-color'),
  async = require('async'),
  file = require('./util').file,
  sep = require('path').sep;

module.exports = function(callback){
  var pluginDir = hexo.plugin_dir,
    scriptDir = hexo.script_dir,
    config = hexo.config;

  if (!config) return callback();

  async.parallel([
    // Load plugins
    function(next){
      fs.exists(pluginDir, function(exist){
        var plugins = config.plugins || [];

        plugins.forEach(function(item){
          try {
            require(pluginDir + item);
          } catch (err){
            console.log(clc.red('Failed to load plugin: ' + clc.bold(item)));
          }
        });

        next();
      });
    },
    // Load scripts
    function(next){
      fs.exists(scriptDir, function(exist){
        if (!exist) return next();

        file.dir(scriptDir, function(files){
          async.forEach(files, function(item, next){
            var dirs = item.split(sep);

            for (var i=0, len=dirs.length; i<len; i++){
              var front = dirs[i].substr(0, 1);
              if (front === '.' || front === '_') return next();
            }

            require(scriptDir + item);
            next();
          }, next);
        });
      });
    }
  ], callback);
};