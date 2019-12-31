'use strict';

const { join, sep } = require('path');
const { appendFile, mkdir, mkdirs, rename, rmdir, stat, unlink, writeFile } = require('hexo-fs');
const Promise = require('bluebird');
const { hash, Pattern } = require('hexo-util');
const { spy } = require('sinon');

describe('Box', () => {
  const Hexo = require('../../../lib/hexo');
  const baseDir = join(__dirname, 'box_tmp');
  const Box = require('../../../lib/box');

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
    const errorCallback = spy(err => {
      err.should.have.property('message', 'fn must be a function');
    });

    try {
      box.addProcessor('test');
    } catch (err) {
      errorCallback(err);
    }

    errorCallback.calledOnce.should.be.true;
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

    const keys = Object.keys(data);
    let key, item;

    for (let i = 0, len = keys.length; i < len; i++) {
      key = keys[i];
      item = data[key];

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

    const file = processor.args[0][0];
    file.type.should.eql('create');
    file.path.should.eql(name);

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

    const file = processor.args[0][0];
    file.type.should.eql('update');
    file.path.should.eql(name);

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

    const file = processor.args[0][0];
    file.type.should.eql('skip');
    file.path.should.eql(name);

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

    const file = processor.args[0][0];
    file.type.should.eql('skip');
    file.path.should.eql(name);

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

    const file = processor.args[0][0];
    file.type.should.eql('skip');
    file.path.should.eql(name);

    await rmdir(box.base);
  });

  it('process() - delete', async () => {
    const box = newBox('test');
    const cacheId = 'test/a.txt';

    const processor = spy(file => {
      file.type.should.eql('delete');
    });

    box.addProcessor(processor);

    await Promise.all([
      mkdirs(box.base),
      box.Cache.insert({
        _id: cacheId
      })
    ]);
    await box.process();

    processor.calledOnce.should.eql(true);

    await rmdir(box.base);
  });

  it('process() - params', async () => {
    const box = newBox('test');
    const path = join(box.base, 'posts', '123456');

    const processor = spy(file => {
      file.params.id.should.eql('123456');
    });

    box.addProcessor('posts/:id', processor);

    await writeFile(path, 'a');
    await box.process();

    processor.calledOnce.should.eql(true);

    await rmdir(box.base);
  });

  it('process() - handle null ignore', async () => {
    const box = newBox('test', { ignore: null });
    const data = {};

    box.addProcessor(file => {
      data[file.path] = file;
    });

    await Promise.all([
      writeFile(join(box.base, 'foo.txt'), 'foo')
    ]);
    await box.process();

    const keys = Object.keys(data);

    keys.length.should.eql(1);
    keys[0].should.eql('foo.txt');

    await rmdir(box.base);
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

    const keys = Object.keys(data);

    keys.length.should.eql(1);
    keys[0].should.eql('foo.txt');

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

    const keys = Object.keys(data);

    keys.length.should.eql(1);
    keys[0].should.eql('foo.txt');

    await rmdir(box.base);
  });

  it('process() - skip node_modules of theme by default', async () => {
    const box = newBox('test', { ignore: null });
    const data = {};

    box.addProcessor(file => {
      data[file.path] = file;
    });

    await Promise.all([
      writeFile(join(box.base, 'foo.txt'), 'foo'),
      writeFile(join(box.base, 'themes', 'bar', 'node_modules', 'bar_library', 'bar.js'), 'themes')
    ]);
    await box.process();

    const keys = Object.keys(data);

    keys.length.should.eql(1);
    keys[0].should.eql('foo.txt');

    await rmdir(box.base);
  });

  it('process() - always skip node_modules of theme', async () => {
    const box = newBox('test', { ignore: '**/ignore_me' });
    const data = {};

    box.addProcessor(file => {
      data[file.path] = file;
    });

    await Promise.all([
      writeFile(join(box.base, 'foo.txt'), 'foo'),
      writeFile(join(box.base, 'ignore_me', 'bar.txt'), 'ignore_me'),
      writeFile(join(box.base, 'themes', 'bar', 'node_modules', 'bar_library', 'bar.js'), 'themes')
    ]);
    await box.process();

    const keys = Object.keys(data);

    keys.length.should.eql(1);
    keys[0].should.eql('foo.txt');

    await rmdir(box.base);
  });

  it('watch() - create', async () => {
    const box = newBox('test');
    const path = 'a.txt';
    const src = join(box.base, path);
    const processor = spy();

    box.addProcessor(processor);

    await Promise.all([writeFile(src, 'a')]);
    await box.watch();
    box.isWatching().should.eql(true);
    await Promise.delay(500);

    const file = processor.args[0][0];

    file.source.should.eql(src);
    file.path.should.eql(path);
    file.type.should.eql('create');
    file.params.should.eql({});

    box.unwatch();
    await rmdir(box.base);
  });

  it('watch() - update', async () => {
    const box = newBox('test');
    const path = 'a.txt';
    const src = join(box.base, path);
    const cacheId = 'test/' + path;
    const Cache = box.Cache;
    const processor = spy();

    box.addProcessor(processor);

    await Promise.all([
      writeFile(src, 'a'),
      Cache.insert({_id: cacheId})
    ]);
    await box.watch();
    await appendFile(src, 'b');
    await Promise.delay(500);

    const file = processor.lastCall.args[0];

    file.source.should.eql(src);
    file.path.should.eql(path);
    file.type.should.eql('update');
    file.params.should.eql({});

    box.unwatch();
    await rmdir(box.base);
  });

  it('watch() - delete', async () => {
    const box = newBox('test');
    const path = 'a.txt';
    const src = join(box.base, path);
    const cacheId = 'test/' + path;
    const Cache = box.Cache;
    const processor = spy();

    box.addProcessor(processor);

    await Promise.all([
      writeFile(src, 'a'),
      Cache.insert({_id: cacheId})
    ]);
    await box.watch();
    await unlink(src);
    await Promise.delay(500);

    const file = processor.lastCall.args[0];

    file.source.should.eql(src);
    file.path.should.eql(path);
    file.type.should.eql('delete');
    file.params.should.eql({});

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
    const Cache = box.Cache;
    const processor = spy();

    box.addProcessor(processor);

    await Promise.all([
      writeFile(src, 'a'),
      Cache.insert({_id: cacheId})
    ]);
    await box.watch();
    await rename(src, newSrc);
    await Promise.delay(500);

    const lastTwoCalls = processor.args.slice(processor.args.length - 2, processor.args.length);

    lastTwoCalls.forEach(args => {
      const file = args[0];

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
    });

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
    const Cache = box.Cache;
    const processor = spy();

    box.addProcessor(processor);

    await Promise.all([
      writeFile(src, 'a'),
      Cache.insert({_id: cacheId})
    ]);
    await box.watch();
    await rename(join(box.base, 'a'), join(box.base, 'b'));
    await Promise.delay(500);

    const lastTwoCalls = processor.args.slice(processor.args.length - 2, processor.args.length);

    lastTwoCalls.forEach(args => {
      const file = args[0];

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
    });

    box.unwatch();
    await rmdir(box.base);
  });

  it('watch() - update with simple "ignore" option', async () => {
    const box = newBox('test', {ignore: '**/ignore_me'});
    const path1 = 'a.txt';
    const path2 = 'b.txt';
    const src1 = join(box.base, path1);
    const src2 = join(box.base, 'ignore_me', path2);
    const cacheId1 = 'test/' + path1;
    const cacheId2 = 'test/ignore_me/' + path2;
    const Cache = box.Cache;
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

    file.source.should.eql(src1);
    file.path.should.eql(path1);
    file.type.should.eql('update');
    file.params.should.eql({});

    await appendFile(src2, 'bbb');
    await Promise.delay(500);

    const file2 = processor.lastCall.args[0];
    file2.should.eql(file); // not changed

    box.unwatch();
    await rmdir(box.base);
  });

  it('watch() - update with complex "ignore" option', async () => {
    const box = newBox('test', {ignore: ['**/ignore_me', '**/ignore_me_too.txt']});
    const path1 = 'a.txt';
    const path2 = 'b.txt';
    const path3 = 'ignore_me_too.txt';
    const src1 = join(box.base, path1);
    const src2 = join(box.base, 'ignore_me', path2);
    const src3 = join(box.base, path3);
    const cacheId1 = 'test/' + path1;
    const cacheId2 = 'test/ignore_me/' + path2;
    const cacheId3 = 'test/' + path3;
    const Cache = box.Cache;
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

    file.source.should.eql(src1);
    file.path.should.eql(path1);
    file.type.should.eql('update');
    file.params.should.eql({});

    await appendFile(src2, 'bbb');
    await Promise.delay(500);

    const file2 = processor.lastCall.args[0];
    file2.should.eql(file); // not changed

    await appendFile(src3, 'ccc');
    await Promise.delay(500);

    const file3 = processor.lastCall.args[0];
    file3.should.eql(file); // not changed

    box.unwatch();
    await rmdir(box.base);
  });

  it('watch() - watcher has started', async () => {
    const box = newBox();

    await box.watch();
    const errorCallback = spy(err => {
      err.should.have.property('message', 'Watcher has already started.');
    });

    await box.watch().catch(errorCallback);
    errorCallback.calledOnce.should.eql(true);

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
    processor.called.should.eql(false);

    box.unwatch();
    await rmdir(box.base);
  });

  it('isWatching()', async () => {
    const box = newBox();

    box.isWatching().should.eql(false);

    await box.watch();
    box.isWatching().should.eql(true);

    box.unwatch();
    box.isWatching().should.eql(false);

    box.unwatch();
  });

  it('processBefore & processAfter events', async () => {
    const box = newBox('test');

    const beforeSpy = spy(file => {
      file.type.should.eql('create');
      file.path.should.eql('a.txt');
    });

    const afterSpy = spy(file => {
      file.type.should.eql('create');
      file.path.should.eql('a.txt');
    });

    box.on('processBefore', beforeSpy);
    box.on('processAfter', afterSpy);

    await writeFile(join(box.base, 'a.txt'), 'a');
    await box.process();

    beforeSpy.calledOnce.should.eql(true);
    afterSpy.calledOnce.should.eql(true);

    await rmdir(box.base);
  });
});
