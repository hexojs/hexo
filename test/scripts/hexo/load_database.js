'use strict';

const pathFn = require('path');
const fs = require('hexo-fs');

describe('Load database', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(pathFn.join(__dirname, 'db_test'), {silent: true});
  const loadDatabase = require('../../../lib/hexo/load_database');
  const dbPath = hexo.database.options.path;

  const fixture = {
    meta: {
      version: 1,
      warehouse: require('warehouse').version
    },
    models: {
      Test: [
        {_id: 'A'},
        {_id: 'B'},
        {_id: 'C'}
      ]
    }
  };

  before(() => fs.mkdirs(hexo.base_dir));

  beforeEach(() => {
    hexo._dbLoaded = false;
  });

  after(async() => {
    const exist = await fs.exists(dbPath);
    if (exist) await fs.unlink(dbPath);
    fs.rmdir(hexo.base_dir);
  });

  it('database does not exist', () => loadDatabase(hexo));

  it('database load success', async() => {
    await fs.writeFile(dbPath, JSON.stringify(fixture));
    await loadDatabase(hexo);
    hexo._dbLoaded.should.eql(true);
    hexo.model('Test').toArray({lean: true}).should.eql(fixture.models.Test);
    hexo.model('Test').destroy();

    await fs.unlink(dbPath);
  });

  it('don\'t load database if loaded', async() => {
    hexo._dbLoaded = true;

    await fs.writeFile(dbPath, JSON.stringify(fixture));
    await loadDatabase(hexo);

    hexo.model('Test').length.should.eql(0);

    await fs.unlink(dbPath);
  });

  // I don't know why this test case can't pass on Windows
  // It always throws EPERM error
  it('database load failed', async() => {
    await fs.writeFile(dbPath, '{1423432: 324');
    await loadDatabase(hexo);
    hexo._dbLoaded.should.eql(false);
    const exist = await fs.exists(dbPath);
    exist.should.eql(false);
  });
});
