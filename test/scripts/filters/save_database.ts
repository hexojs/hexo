import Hexo from '../../../lib/hexo';
import { exists, unlink } from 'hexo-fs';
import saveDatabaseFilter from '../../../lib/plugins/filter/before_exit/save_database';
type SaveDatabaseFilterParams = Parameters<typeof saveDatabaseFilter>
type SaveDatabaseFilterReturn = ReturnType<typeof saveDatabaseFilter>

describe('Save database', () => {
  const hexo = new Hexo();
  const saveDatabase: (...args: SaveDatabaseFilterParams) => Promise<SaveDatabaseFilterReturn> = (...args: SaveDatabaseFilterParams) => {
    return new Promise(resolve => {
      const boundSaveDatabase = saveDatabaseFilter.bind(hexo);
      resolve(boundSaveDatabase(...args));
    });
  };
  const dbPath = hexo.database.options.path;

  it('default', async () => {
    hexo.env.init = true;
    hexo._dbLoaded = true;

    await saveDatabase();
    const exist = await exists(dbPath);
    exist.should.be.true;

    unlink(dbPath);
  });

  it('do nothing if hexo is not initialized', async () => {
    hexo.env.init = false;
    hexo._dbLoaded = true;

    await saveDatabase();
    const exist = await exists(dbPath);
    exist.should.be.false;
  });

  it('do nothing if database is not loaded', async () => {
    hexo.env.init = true;
    hexo._dbLoaded = false;

    await saveDatabase();
    const exist = await exists(dbPath);
    exist.should.be.false;
  });
});
