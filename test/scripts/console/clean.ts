import { exists, mkdirs, unlink, writeFile } from 'hexo-fs';
import Hexo from '../../../lib/hexo';
import cleanConsole from '../../../lib/plugins/console/clean';
type OriginalParams = Parameters<typeof cleanConsole>;
type OriginalReturn = ReturnType<typeof cleanConsole>;
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Cross-compatible __dirname for ESM and CJS, without require
let __hexo_dirname: string;
if (typeof __dirname !== 'undefined') {
  // CJS
  __hexo_dirname = __dirname;
} else {
  // ESM (only works in ESM context)
  let url = '';
  try {
    // @ts-ignore: import.meta.url is only available in ESM, safe to ignore in CJS
    url = import.meta.url;
  } catch {}
  __hexo_dirname = url ? dirname(fileURLToPath(url)) : '';
}

describe('clean', () => {
  let hexo: Hexo, clean: (...args: OriginalParams) => OriginalReturn;

  beforeEach(() => {
    hexo = new Hexo(__hexo_dirname, {silent: true});
    clean = cleanConsole.bind(hexo);
  });


  it('delete database', async () => {
    const dbPath = hexo.database.options.path;

    await writeFile(dbPath, '');
    await clean();
    const exist = await exists(dbPath);

    exist.should.be.false;
  });

  it('delete public folder', async () => {
    const publicDir = hexo.public_dir;

    await mkdirs(publicDir);
    await clean();
    const exist = await exists(publicDir);

    exist.should.be.false;
  });

  it('execute corresponding filter', async () => {
    const extraDbPath = hexo.database.options.path + '.tmp';

    hexo.extend.filter.register('after_clean', () => {
      return unlink(extraDbPath);
    });

    await writeFile(extraDbPath, '');
    await clean();
    const exist = await exists(extraDbPath);

    exist.should.be.false;
  });
});
