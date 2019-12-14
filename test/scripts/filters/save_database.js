'use strict';

const { exists, unlink } = require('hexo-fs');
const Promise = require('bluebird');

describe('Save database', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  const saveDatabase = Promise.method(require('../../../lib/plugins/filter/before_exit/save_database')).bind(hexo);
  const dbPath = hexo.database.options.path;

  it('default', async() => {
    hexo.env.init = true;
    hexo._dbLoaded = true;

    await saveDatabase();
    const exist = await exists(dbPath);
    exist.should.eql(true);

    unlink(dbPath);
  });

  it('do nothing if hexo is not initialized', async() => {
    hexo.env.init = false;
    hexo._dbLoaded = true;

    await saveDatabase();
    const exist = await exists(dbPath);
    exist.should.eql(false);
  });

  it('do nothing if database is not loaded', async() => {
    hexo.env.init = true;
    hexo._dbLoaded = false;

    await saveDatabase();
    const exist = await exists(dbPath);
    exist.should.eql(false);
  });
});
