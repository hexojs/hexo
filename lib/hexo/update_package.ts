import { join } from 'path';
import { writeFile, exists, readFile } from 'hexo-fs';
import type Hexo from './index';

export = (ctx: Hexo) => {
  const pkgPath = join(ctx.base_dir, 'package.json');

  return readPkg(pkgPath).then(pkg => {
    if (!pkg) return;

    ctx.env.init = true;

    if (pkg.hexo.version === ctx.version) return;

    pkg.hexo.version = ctx.version;

    ctx.log.debug('Updating package.json');
    return writeFile(pkgPath, JSON.stringify(pkg, null, '  '));
  });
};

function readPkg(path: string) {
  return exists(path).then(exist => {
    if (!exist) return;

    return readFile(path).then(content => {
      const pkg = JSON.parse(content as string);
      if (typeof pkg.hexo !== 'object') return;

      return pkg;
    });
  });
}
