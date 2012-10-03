var util = require('./util'),
  file = util.file,
  async = require('async'),
  fs = require('fs'),
  path = require('path');

module.exports = function(callback){
  var pluginDir = hexo.plugin_dir,
    config = hexo.config;

  async.forEach(config.plugins, function(item, next){
    file.read(pluginDir + item + '/package.json', function(err, file){
      if (err) throw err;

      var main = JSON.parse(file).main;
      require(path.resolve(pluginDir + item, main));
      next(null);
    });
  }, callback);
};