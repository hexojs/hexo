'use strict';

const { join, sep } = require('path');
const { appendFile, mkdir, mkdirs, rename, rmdir, stat, unlink, writeFile } = require('hexo-fs');
const Promise = require('bluebird');
const { hash, Pattern } = require('hexo-util');
const { spy, match, assert: sinonAssert } = require('sinon');

describe('Box', () => {
  const Hexo = require('../../../dist/hexo');
  const baseDir = join(__dirname, 'box_tmp');
  const Box = require('../../../dist/box').default;

  const newBox = (path, config) => {
    const hexo = new Hexo(baseDir, { silent: true });
    hexo.config = Object.assign(hexo.config, config);
    const base = path ? join(baseDir, path) : baseDir;
    return new Box(hexo, base);
  };

  before(() => mkdir(baseDir));

  after(() => rmdir(baseDir));

  it('constructor - add trailing "/" to the base path', () => {
    const box = newBox('foo');
    box.base.should.eql(join(baseDir, 'foo') + sep);
  });

  it('addProcessor() - no pattern', () => {
    const box = newBox();

    box.addProcessor(() => 'test');

    const p = box.processors[0];

    p.pattern.match('').should.eql({});
    p.process().should.eql('test');
  });

  it('addProcessor() - with regex', () => {
    const box = newBox();

    box.addProcessor(/^foo/, () => 'test');

    const p = box.processors[0];

    p.pattern.match('foobar').should.be.ok;
    p.pattern.should.be.an.instanceof(Pattern);
    p.process().should.eql('test');
  });

  it('addProcessor() - with pattern', () => {
    const box = newBox();

    box.addProcessor(new Pattern(/^foo/), () => 'test');

    const p = box.processors[0];

    p.pattern.match('foobar').should.be.ok;
    p.pattern.should.be.an.instanceof(Pattern);
    p.process().should.eql('test');
  });

  it('addProcessor() - no fn', () => {
    const box = newBox();

    should.throw(() => box.addProcessor('test'), 'fn must be a function');
  });

  it('process()', async () => {
    const box = newBox('test');
    const data = {};

    box.addProcessor(file => {
      data[file.path] = file;
    });

    await Promise.all([
      writeFile(join(box.base, 'a.txt'), 'a'),
      writeFile(join(box.base, 'b', 'c.js'), 'c')
    ]);

    await box.process();

    for (const [key, item] of Object.entries(data)) {
      item.path.should.eql(key);
      item.source.should.eql(join(box.base, key));
      item.type.should.eql('create');
      item.params.should.eql({});
    }

    await rmdir(box.base);
  });

  it('process() - do nothing if target does not exist', async () => {
    const box = newBox('test');

    return box.process();
  });

  it('process() - create', async () => {
    const box = newBox('test');
    const name = 'a.txt';
    const path = join(box.base, name);

    const processor = spy();
    box.addProcessor(processor);

    await writeFile(path, 'a');
    await box.process();

    sinonAssert.calledWithMatch(processor, { type: 'create', path: name });

    await rmdir(box.base);
  });

  it('process() - update (mtime changed and hash changed)', async () => {
    const box = newBox('test');
    const name = 'a.txt';
    const path = join(box.base, name);
    const cacheId = 'test/' + name;

    const processor = spy();
    box.addProcessor(processor);

    await Promise.all([
      writeFile(path, 'a'),
      box.Cache.insert({
        _id: cacheId,
        modified: 0,
        hash: hash('b').toString('hex')
      })
    ]);
    await box.process();

    sinonAssert.calledWithMatch(processor, { type: 'update', path: name });

    await rmdir(box.base);
  });

  it('process() - skip (mtime changed but hash matched)', async () => {
    const box = newBox('test');
    const name = 'a.txt';
    const path = join(box.base, name);
    const cacheId = 'test/' + name;

    const processor = spy();
    box.addProcessor(processor);

    await writeFile(path, 'a');
    await stat(path);
    await box.Cache.insert({
      _id: cacheId,
      modified: 0,
      hash: hash('a').toString('hex')
    });
    await box.process();

    sinonAssert.calledWithMatch(processor, { type: 'skip', path: name });

    await rmdir(box.base);
  });

  it('process() - skip (hash changed but mtime matched)', async () => {
    const box = newBox('test');
    const name = 'a.txt';
    const path = join(box.base, name);
    const cacheId = 'test/' + name;

    const processor = spy();
    box.addProcessor(processor);

    await writeFile(path, 'a');
    const stats = await stat(path);
    await box.Cache.insert({
      _id: cacheId,
      modified: stats.mtime,
      hash: hash('b').toString('hex')
    });
    await box.process();

    sinonAssert.calledWithMatch(processor, { type: 'skip', path: name });

    await rmdir(box.base);
  });

  it('process() - skip (mtime matched and hash matched)', async () => {
    const box = newBox('test');
    const name = 'a.txt';
    const path = join(box.base, name);
    const cacheId = 'test/' + name;

    const processor = spy();
    box.addProcessor(processor);

    await writeFile(path, 'a');
    const stats = await stat(path);
    await box.Cache.insert({
      _id: cacheId,
      modified: stats.mtime,
      hash: hash('a').toString('hex')
    });
    await box.process();

    sinonAssert.calledWithMatch(processor, { type: 'skip', path: name });

    await rmdir(box.base);
  });

  it('process() - delete', async () => {
    const box = newBox('test');
    const cacheId = 'test/a.txt';

    const processor = spy();
    box.addProcessor(processor);

    await Promise.all([
      mkdirs(box.base),
      box.Cache.insert({
        _id: cacheId
      })
    ]);
    await box.process();

    sinonAssert.calledWith(processor, match.has('type', 'delete'));
    processor.calledOnce.should.be.true;

    await rmdir(box.base);
  });

  it('process() - params', async () => {
    const box = newBox('test');
    const path = join(box.base, 'posts', '123456');

    const processor = spy();

    box.addProcessor('posts/:id', processor);

    await writeFile(path, 'a');
    await box.process();

    sinonAssert.calledWith(processor, match.has('params', match.has('id', '123456')));
    processor.calledOnce.should.be.true;

    await rmdir(box.base);
  });

  it('process() - handle null ignore', async () => {
    const box = newBox('test', { ignore: null });
    const data = {};

    box.addProcessor(file => {
      data[file.path] = file;
    });

    await writeFile(join(box.base, 'foo.txt'), 'foo');
    await box.process();

    data.should.have.all.keys(['foo.txt']);

    await rmdir(box.base);
  });

  it('process() - error ignore - 1', async () => {
    const box = newBox('test', { ignore: [null] });
    box.options.ignored.should.eql([]);
  });

  it('process() - error ignore - 2', async () => {
    const box = newBox('test', { ignore: [111] });
    box.options.ignored.should.eql([]);
  });

  it('process() - skip files if they match a glob epression in ignore', async () => {
    const box = newBox('test', { ignore: '**/ignore_me' });
    const data = {};

    box.addProcessor(file => {
      data[file.path] = file;
    });

    await Promise.all([
      writeFile(join(box.base, 'foo.txt'), 'foo'),
      writeFile(join(box.base, 'ignore_me', 'bar.txt'), 'ignore_me')
    ]);
    await box.process();

    data.should.have.all.keys(['foo.txt']);

    await rmdir(box.base);
  });

  it('process() - skip files if they match any of the glob expressions in ignore', async () => {
    const box = newBox('test', { ignore: ['**/ignore_me', '**/ignore_me_too.txt'] });
    const data = {};

    box.addProcessor(file => {
      data[file.path] = file;
    });

    await Promise.all([
      writeFile(join(box.base, 'foo.txt'), 'foo'),
      writeFile(join(box.base, 'ignore_me', 'bar.txt'), 'ignore_me'),
      writeFile(join(box.base, 'ignore_me_too.txt'), 'ignore_me_too')
    ]);
    await box.process();

    data.should.have.all.keys(['foo.txt']);

    await rmdir(box.base);
  });

  it('watch() - create', async () => {
    const box = newBox('test');
    const path = 'a.txt';
    const src = join(box.base, path);
    const processor = spy();

    box.addProcessor(processor);

    await writeFile(src, 'a');
    await box.watch();
    box.isWatching().should.be.true;
    await Promise.delay(500);

    sinonAssert.calledWithMatch(processor.firstCall, {
      source: src,
      path: path,
      type: 'create',
      params: {}
    });

    box.unwatch();
    await rmdir(box.base);
  });

  it('watch() - update', async () => {
    const box = newBox('test');
    const path = 'a.txt';
    const src = join(box.base, path);
    const cacheId = 'test/' + path;
    const { Cache } = box;
    const processor = spy();

    box.addProcessor(processor);

    await Promise.all([
      writeFile(src, 'a'),
      Cache.insert({_id: cacheId})
    ]);
    await box.watch();
    await appendFile(src, 'b');
    await Promise.delay(500);

    sinonAssert.calledWithMatch(processor.lastCall, {
      source: src,
      path: path,
      type: 'update',
      params: {}
    });

    box.unwatch();
    await rmdir(box.base);
  });

  it('watch() - delete', async () => {
    const box = newBox('test');
    const path = 'a.txt';
    const src = join(box.base, path);
    const cacheId = 'test/' + path;
    const { Cache } = box;
    const processor = spy();

    box.addProcessor(processor);

    await Promise.all([
      writeFile(src, 'a'),
      Cache.insert({_id: cacheId})
    ]);
    await box.watch();
    await unlink(src);
    await Promise.delay(500);

    sinonAssert.calledWithMatch(processor.lastCall, {
      source: src,
      path: path,
      type: 'delete',
      params: {}
    });

    box.unwatch();
    await rmdir(box.base);
  });

  it('watch() - rename file', async () => {
    const box = newBox('test');
    const path = 'a.txt';
    const src = join(box.base, path);
    const newPath = 'b.txt';
    const newSrc = join(box.base, newPath);
    const cacheId = 'test/' + path;
    const { Cache } = box;
    const processor = spy();

    box.addProcessor(processor);

    await Promise.all([
      writeFile(src, 'a'),
      Cache.insert({_id: cacheId})
    ]);
    await box.watch();
    await rename(src, newSrc);
    await Promise.delay(500);

    for (const [file] of processor.args.slice(-2)) {
      switch (file.type) {
        case 'create':
          file.source.should.eql(newSrc);
          file.path.should.eql(newPath);
          break;

        case 'delete':
          file.source.should.eql(src);
          file.path.should.eql(path);
          break;
      }
    }

    box.unwatch();
    await rmdir(box.base);
  });

  it('watch() - rename folder', async () => {
    const box = newBox('test');
    const path = 'a/b.txt';
    const src = join(box.base, path);
    const newPath = 'b/b.txt';
    const newSrc = join(box.base, newPath);
    const cacheId = 'test/' + path;
    const { Cache } = box;
    const processor = spy();

    box.addProcessor(processor);

    await Promise.all([
      writeFile(src, 'a'),
      Cache.insert({_id: cacheId})
    ]);
    await box.watch();
    await rename(join(box.base, 'a'), join(box.base, 'b'));
    await Promise.delay(500);

    for (const [file] of processor.args.slice(-2)) {
      switch (file.type) {
        case 'create':
          file.source.should.eql(newSrc);
          file.path.should.eql(newPath);
          break;

        case 'delete':
          file.source.should.eql(src);
          file.path.should.eql(path);
          break;
      }
    }

    box.unwatch();
    await rmdir(box.base);
  });

  it('watch() - update with simple "ignore" option', async () => {
    const box = newBox('test', {ignore: '**/ignore_me/**'});
    const path1 = 'a.txt';
    const path2 = 'b.txt';
    const src1 = join(box.base, path1);
    const src2 = join(box.base, 'ignore_me', path2);
    const cacheId1 = 'test/' + path1;
    const cacheId2 = 'test/ignore_me/' + path2;
    const { Cache } = box;
    const processor = spy();

    box.addProcessor(processor);

    await Promise.all([
      writeFile(src1, 'a'),
      Cache.insert({_id: cacheId1})
    ]);
    await Promise.all([
      writeFile(src2, 'b'),
      Cache.insert({_id: cacheId2})
    ]);
    await box.watch();
    await appendFile(src1, 'aaa');
    await Promise.delay(500);

    const file = processor.lastCall.args[0];

    file.should.deep.include({
      source: src1,
      path: path1,
      type: 'update',
      params: {}
    });

    await appendFile(src2, 'bbb');
    await Promise.delay(500);

    const file2 = processor.lastCall.args[0];
    file2.should.eql(file); // not changed

    box.unwatch();
    await rmdir(box.base);
  });

  it('watch() - update with complex "ignore" option', async () => {
    const box = newBox('test', {ignore: ['**/ignore_me/**', '**/ignore_me_too.txt']});
    const path1 = 'a.txt';
    const path2 = 'b.txt';
    const path3 = 'ignore_me_too.txt';
    const src1 = join(box.base, path1);
    const src2 = join(box.base, 'ignore_me', path2);
    const src3 = join(box.base, path3);
    const cacheId1 = 'test/' + path1;
    const cacheId2 = 'test/ignore_me/' + path2;
    const cacheId3 = 'test/' + path3;
    const { Cache } = box;
    const processor = spy();

    box.addProcessor(processor);

    await Promise.all([
      writeFile(src1, 'a'),
      Cache.insert({_id: cacheId1})
    ]);
    await Promise.all([
      writeFile(src2, 'b'),
      Cache.insert({_id: cacheId2})
    ]);
    await Promise.all([
      writeFile(src3, 'c'),
      Cache.insert({_id: cacheId3})
    ]);
    await box.watch();
    await appendFile(src1, 'aaa');
    await Promise.delay(500);

    const file = processor.lastCall.args[0];

    file.should.deep.include({
      source: src1,
      path: path1,
      type: 'update',
      params: {}
    });

    await appendFile(src2, 'bbb');
    await Promise.delay(500);

    processor.lastCall.args[0].should.eql(file); // not changed

    await appendFile(src3, 'ccc');
    await Promise.delay(500);

    processor.lastCall.args[0].should.eql(file); // not changed

    box.unwatch();
    await rmdir(box.base);
  });

  it('watch() - watcher has started', async () => {
    const box = newBox();

    await box.watch();

    await box.watch().then(() => {
      should.fail('Return value must be rejected');
    }, err => {
      err.should.property('message', 'Watcher has already started.');
    });

    box.unwatch();
  });

  it('watch() - run process() before start watching', async () => {
    const box = newBox('test');
    const data = [];

    box.addProcessor(file => {
      data.push(file.path);
    });

    await Promise.all([
      writeFile(join(box.base, 'a.txt'), 'a'),
      writeFile(join(box.base, 'b', 'c.js'), 'c')
    ]);
    await box.watch();
    data.should.have.members(['a.txt', 'b/c.js']);

    box.unwatch();
    await rmdir(box.base);
  });

  it('unwatch()', async () => {
    const box = newBox('test');
    const processor = spy();

    await box.watch();
    box.addProcessor(processor);
    box.unwatch();

    await writeFile(join(box.base, 'a.txt'), 'a');
    processor.called.should.be.false;

    box.unwatch();
    await rmdir(box.base);
  });

  it('isWatching()', async () => {
    const box = newBox();

    box.isWatching().should.be.false;

    await box.watch();
    box.isWatching().should.be.true;

    box.unwatch();
    box.isWatching().should.be.false;

    box.unwatch();
  });

  it('processBefore & processAfter events', async () => {
    const box = newBox('test');

    const beforeSpy = spy();
    const afterSpy = spy();

    box.on('processBefore', beforeSpy);
    box.on('processAfter', afterSpy);

    await writeFile(join(box.base, 'a.txt'), 'a');
    await box.process();

    sinonAssert.calledWithMatch(beforeSpy, { type: 'create', path: 'a.txt' });
    sinonAssert.calledWithMatch(afterSpy, { type: 'create', path: 'a.txt' });
    beforeSpy.calledOnce.should.be.true;
    afterSpy.calledOnce.should.be.true;

    await rmdir(box.base);
  });
});
