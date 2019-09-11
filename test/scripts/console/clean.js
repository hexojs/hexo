'use strict';

const fs = require('hexo-fs');

describe('clean', () => {
  const Hexo = require('../../../lib/hexo');
  let hexo, clean;

  beforeEach(() => {
    hexo = new Hexo(__dirname, { silent: true });
    clean = require('../../../lib/plugins/console/clean').bind(hexo);
  });

  it('delete database', () => {
    const dbPath = hexo.database.options.path;

    return fs
      .writeFile(dbPath, '')
      .then(() => clean())
      .then(() => fs.exists(dbPath))
      .then(exist => {
        exist.should.be.false;
      });
  });

  it('delete public folder', () => {
    const publicDir = hexo.public_dir;

    return fs
      .mkdirs(publicDir)
      .then(() => clean())
      .then(() => fs.exists(publicDir))
      .then(exist => {
        exist.should.be.false;
      });
  });

  it('execute corresponding filter', () => {
    const extraDbPath = hexo.database.options.path + '.tmp';

    hexo.extend.filter.register('after_clean', () => {
      return fs.unlink(extraDbPath);
    });

    return fs
      .writeFile(extraDbPath, '')
      .then(() => clean())
      .then(() => fs.exists(extraDbPath))
      .then(exist => {
        exist.should.be.false;
      });
  });
});
