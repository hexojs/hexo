var Promise = require('bluebird');
var pathFn = require('path');
var tildify = require('tildify');
var fs = require('hexo-fs');

require('colors');

module.exports = function(ctx){
  return Promise.filter([
    ctx.script_dir,
    ctx.theme_script_dir
  ], function(scriptDir){
    return scriptDir ? fs.exists(scriptDir) : false;
  }).map(function(scriptDir){
    var scriptPath = '';

    return fs.listDir(scriptDir).map(function(name){
      scriptPath = pathFn.join(scriptDir, name);
      require(scriptPath);
      ctx.log.debug('Script loaded: %s', tildify(scriptPath).magenta);
    }).catch(function(err){
      ctx.log.error({err: err}, 'Script load failed: %s', tildify(scriptPath).magenta);
    });
  });
};