'use strict';

var pathFn = require('path');
var fs = require('hexo-fs');

module.exports = function(ctx){
  var pkgPath = pathFn.join(ctx.base_dir, 'package.json');

  return readPkg(pkgPath).then(function(pkg){
    if (!pkg) return;

    ctx.env.init = true;

    if (pkg.hexo.version === ctx.version) return;

    pkg.hexo.version = ctx.version;

    ctx.log.debug('Updating package.json');
    return fs.writeFile(pkgPath, JSON.stringify(pkg, null, '  '));
  });
};

function readPkg(path){
  return fs.exists(path).then(function(exist){
    if (!exist) return;

    return fs.readFile(path).then(function(content){
      var pkg = JSON.parse(content);
      if (typeof pkg.hexo !== 'object') return;

      return pkg;
    });
  });
}