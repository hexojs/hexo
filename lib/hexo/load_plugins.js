var pathFn = require('path');
var util = require('../util');
var fs = util.fs;

require('colors');

module.exports = function(ctx){
  if (!ctx.env.init || ctx.env.safe) return;

  var pluginDir = ctx.plugin_dir;
  var currentName = '';

  return fs.exists(pluginDir).then(function(exist){
    return exist ? fs.readdir(pluginDir) : [];
  }).filter(function(name){
    return name.slice(0, 5) === 'hexo-';
  }).map(function(name){
    currentName = name;
    require(pathFn.join(pluginDir, name));
    ctx.log.debug('Plugin loaded: %s', name.magenta);
  }).catch(function(err){
    ctx.log.error({err: err}, 'Plugin load failed: %s', currentName.magenta);
  });
};