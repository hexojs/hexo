'use strict';

const { exists, mkdirs, unlink, writeFile } = require('hexo-fs');

describe('clean', () => {
  const Hexo = require('../../../dist/hexo');
  let hexo, clean;

  beforeEach(() => {
    hexo = new Hexo(__dirname, {silent: true});
    clean = require('../../../dist/plugins/console/clean').bind(hexo);
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
