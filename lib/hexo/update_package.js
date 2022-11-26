'use strict';

const { join } = require('path');
const fs = require('hexo-fs');

module.exports = ctx => {
  const pkgPath = join(ctx.base_dir, 'package.json');

  return readPkg(pkgPath).then(pkg => {
    if (!pkg) return;

    ctx.env.init = true;

    if (pkg.hexo.version === ctx.version) return;

    pkg.hexo.version = ctx.version;

    ctx.log.debug('Updating package.json');
    return fs.writeFile(pkgPath, JSON.stringify(pkg, null, '  '));
  });
};

function readPkg(path) {
  return fs.exists(path).then(exist => {
    if (!exist) return;

    return fs.readFile(path).then(content => {
      const pkg = JSON.parse(content);
      if (typeof pkg.hexo !== 'object') return;

      return pkg;
    });
  });
}
