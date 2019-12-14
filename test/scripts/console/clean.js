'use strict';

const fs = require('hexo-fs');

describe('clean', () => {
  const Hexo = require('../../../lib/hexo');
  let hexo, clean;

  beforeEach(() => {
    hexo = new Hexo(__dirname, {silent: true});
    clean = require('../../../lib/plugins/console/clean').bind(hexo);
  });

  it('delete database', async() => {
    const dbPath = hexo.database.options.path;

    await fs.writeFile(dbPath, '');
    await clean();
    const exist = await fs.exists(dbPath);

    exist.should.eql(false);
  });

  it('delete public folder', async() => {
    const publicDir = hexo.public_dir;

    await fs.mkdirs(publicDir);
    await clean();
    const exist = await fs.exists(publicDir);

    exist.should.eql(false);
  });

  it('execute corresponding filter', async() => {
    const extraDbPath = hexo.database.options.path + '.tmp';

    hexo.extend.filter.register('after_clean', () => {
      return fs.unlink(extraDbPath);
    });

    await fs.writeFile(extraDbPath, '');
    await clean();
    const exist = await fs.exists(extraDbPath);

    exist.should.eql(false);
  });
});
