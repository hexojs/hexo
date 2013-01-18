var fs = require('graceful-fs'),
  colors = require('colors'),
  async = require('async'),
  file = require('./util').file,
  sep = require('path').sep,
  _ = require('underscore');

module.exports = function(callback){
  var pluginDir = hexo.plugin_dir,
    scriptDir = hexo.script_dir;

  if (!hexo.config) return callback();

  async.parallel([
    // Load plugins
    function(next){
      fs.exists(pluginDir, function(exist){
        if (!exist) return next();

        fs.readdir(pluginDir, function(err, files){
          var plugins = _.filter(files, function(item){
            return item.substring(0, 1) !== '.';
          });

          plugins.forEach(function(item){
            try {
              require(pluginDir + item);
            } catch(e){
              console.log('Failed to load plugin: %s'.red, item.bold);
            }
          });

          next();
        });
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