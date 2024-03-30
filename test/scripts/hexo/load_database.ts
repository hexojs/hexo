import { join } from 'path';
import Hexo from '../../../lib/hexo';
import { exists, mkdirs, rmdir, unlink, writeFile } from 'hexo-fs';
import loadDatabase from '../../../lib/hexo/load_database';

describe('Load database', () => {
  const hexo = new Hexo(join(__dirname, 'db_test'), {silent: true});
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

  before(() => mkdirs(hexo.base_dir));

  beforeEach(() => {
    hexo._dbLoaded = false;
  });

  after(async () => {
    const exist = await exists(dbPath);
    if (exist) await unlink(dbPath);
    rmdir(hexo.base_dir);
  });

  it('database does not exist', () => loadDatabase(hexo));

  it('database load success', async () => {
    await writeFile(dbPath, JSON.stringify(fixture));
    await loadDatabase(hexo);
    hexo._dbLoaded.should.be.true;
    hexo.model('Test').toArray({lean: true}).should.eql(fixture.models.Test);
    hexo.model('Test').destroy();

    await unlink(dbPath);
  });

  it('don\'t load database if loaded', async () => {
    hexo._dbLoaded = true;

    await writeFile(dbPath, JSON.stringify(fixture));
    await loadDatabase(hexo);

    hexo.model('Test').should.have.lengthOf(0);

    await unlink(dbPath);
  });
});

// #3975 workaround for Windows
// Clean-up is not necessary (unlike the above tests),
// because the db file is already removed if invalid
describe('Load database - load failed', () => {
  const hexo = new Hexo(join(__dirname), {silent: true});
  const dbPath = hexo.database.options.path;

  it('database load failed', async () => {
    hexo._dbLoaded = false;

    await writeFile(dbPath, '{1423432: 324');
    await loadDatabase(hexo);
    hexo._dbLoaded.should.be.false;
    const exist = await exists(dbPath);
    exist.should.be.false;
  });
});
