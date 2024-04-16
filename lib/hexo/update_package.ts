import { join } from 'path';
import { writeFile, exists, readFile } from 'hexo-fs';
import type Hexo from './index';
import type Promise from 'bluebird';

export = (ctx: Hexo): Promise<void> => {
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

function readPkg(path: string): Promise<any> {
  return exists(path).then(exist => {
    if (!exist) return;

    return readFile(path).then(content => {
      const pkg = JSON.parse(content);
      if (typeof pkg.hexo !== 'object') return;

      return pkg;
    });
  });
}
