var pathFn = require('path');
var util = require('../util');
var fs = util.fs;

module.exports = function(ctx){
  if (!ctx.env.init) return;

  var packagePath = pathFn.join(ctx.base_dir, 'package.json');
  var log = ctx.log;

  return fs.exists(packagePath).then(function(exist){
    if (exist) return;

    log.debug('Can\'t found package.json. Rebuilding a new one.');
    return fs.copyFile(pathFn.join(hexo.core_dir, 'assets', 'package.json'), packagePath);
  }).then(function(){
    return fs.readFile(packagePath);
  }).then(function(content){
    var json = JSON.parse(content);
    if (json.version === hexo.version) return;

    json.version = hexo.version;

    log.debug('Updating package.json');

    return fs.writeFile(packagePath, JSON.stringify(json, null, '  '));
  });
};