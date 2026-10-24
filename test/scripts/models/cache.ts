import { join } from 'path';
import { rejects } from 'assert';
import { readFile, rmdir, stat, writeFile } from 'hexo-fs';
import { hash } from 'hexo-util';
import { spy, stub, restore, assert as sinonAssert } from 'sinon';
import BluebirdPromise from 'bluebird';
import Hexo from '../../../lib/hexo';
import chai from 'chai';

chai.should();

describe('Cache', () => {
  const hexo = new Hexo();
  const Cache = hexo.model('Cache');

  it('_id - required', async () => {
    try {
      await Cache.insert({});
    } catch (err) {
      err.message.should.eql('ID is not defined');
    }
  });

  describe('compareFile()', () => {
    const baseDir = join(__dirname, 'cache_tmp');
    const id = 'a.txt';
    const path = join(baseDir, id);
    const fileHash = hash('a').toString('hex');
    const hashFn = spy(() => readFile(path).then(content => hash(content).toString('hex')));
    const statFn = spy(() => stat(path));
    let hexo: Hexo, Cache: ReturnType<Hexo['model']>;

    beforeEach(async () => {
      hexo = new Hexo(baseDir, { silent: true });
      Cache = hexo.model('Cache');
      hashFn.resetHistory();
      statFn.resetHistory();
      await writeFile(path, 'a');
    });

    afterEach(() => {
      restore();
      return rmdir(baseDir);
    });

    it('skips hashing when mtime matches', async () => {
      const mtime = (await stat(path)).mtime.getTime();
      await Cache.insert({ _id: id, hash: 'different', modified: mtime });
      const save = spy(Cache, 'save');

      (await Cache.compareFile(id, hashFn, statFn)).should.eql({ type: 'skip' });
      Cache.findById(id).hash.should.eql('different');
      sinonAssert.notCalled(hashFn);
      sinonAssert.notCalled(save);
      sinonAssert.calledOnce(statFn);
    });

    it('persists mtime when hash matches', async () => {
      await Cache.insert({ _id: id, hash: fileHash, modified: 0 });
      const save = spy(Cache, 'save');

      (await Cache.compareFile(id, hashFn, statFn)).should.eql({ type: 'skip' });
      Cache.findById(id).modified.should.eql((await stat(path)).mtime.getTime());
      Cache.findById(id).hash.should.eql(fileHash);
      (await Cache.compareFile(id, hashFn, statFn)).should.eql({ type: 'skip' });
      sinonAssert.calledOnce(hashFn);
      sinonAssert.calledOnce(save);
      sinonAssert.calledTwice(statFn);
      await hexo.database.save();

      const reloaded = new Hexo(baseDir, { silent: true });
      await reloaded.database.load();
      const reloadedCache = reloaded.model('Cache');
      reloadedCache.findById(id).modified.should.eql((await stat(path)).mtime.getTime());
      (await reloadedCache.compareFile(id, hashFn, statFn)).should.eql({ type: 'skip' });
      sinonAssert.calledOnce(hashFn);
    });

    it('propagates stat errors', async () => {
      await Cache.insert({ _id: id, hash: fileHash, modified: 0 });
      const error = new Error('stat failed');
      const failedStat = () => BluebirdPromise.reject(error);

      await rejects(async () => Cache.compareFile(id, hashFn, failedStat), err => err === error);
      Cache.findById(id).modified.should.eql(0);
      sinonAssert.notCalled(hashFn);
    });

    it('propagates hash errors', async () => {
      await Cache.insert({ _id: id, hash: fileHash, modified: 0 });
      const error = new Error('hash failed');
      const failedHash = () => BluebirdPromise.reject(error);

      await rejects(async () => Cache.compareFile(id, failedHash, statFn), err => err === error);
      Cache.findById(id).modified.should.eql(0);
      Cache.findById(id).hash.should.eql(fileHash);
    });

    it('propagates save errors', async () => {
      await Cache.insert({ _id: id, hash: fileHash, modified: 0 });
      const error = new Error('save failed');
      const save = stub(Cache, 'save').callsFake(() => BluebirdPromise.reject(error));

      await rejects(async () => Cache.compareFile(id, hashFn, statFn), err => err === error);
      Cache.findById(id).modified.should.eql(0);
      sinonAssert.calledOnce(save);
    });
  });
});
