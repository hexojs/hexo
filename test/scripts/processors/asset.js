'use strict';

const { dirname, join } = require('path');
const { mkdirs, rmdir, stat, unlink, writeFile } = require('hexo-fs');
const { spy } = require('sinon');

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

describe('asset', () => {
  const Hexo = require('../../../dist/hexo');
  const defaults = require('../../../dist/hexo/default_config');
  const baseDir = join(__dirname, 'asset_test');
  const hexo = new Hexo(baseDir);
  const asset = require('../../../dist/plugins/processor/asset')(hexo);
  const process = asset.process.bind(hexo);
  const { pattern } = asset;
  const { source } = hexo;
  const { File } = source;
  const Asset = hexo.model('Asset');
  const Page = hexo.model('Page');

  function newFile(options) {
    options.source = join(source.base, options.path);
    options.params = {
      renderable: options.renderable
    };

    return new File(options);
  }

  before(async () => {
    await mkdirs(baseDir);
    await hexo.init();
  });

  beforeEach(() => { hexo.config = Object.assign({}, defaults); });

  after(() => rmdir(baseDir));

  it('pattern', () => {
    // Renderable files
    pattern.match('foo.json').should.have.property('renderable', true);

    // Non-renderable files
    pattern.match('foo.txt').should.have.property('renderable', false);

    // Tmp files
    should.not.exist(pattern.match('foo.txt~'));
    should.not.exist(pattern.match('foo.txt%'));

    // Hidden files
    should.not.exist(pattern.match('_foo.txt'));
    should.not.exist(pattern.match('test/_foo.txt'));
    should.not.exist(pattern.match('.foo.txt'));
    should.not.exist(pattern.match('test/.foo.txt'));

    // Include files
    hexo.config.include = ['fff/**'];
    pattern.match('fff/_foo.txt').should.exist;
    hexo.config.include = [];

    // Exclude files
    hexo.config.exclude = ['fff/**'];
    should.not.exist(pattern.match('fff/foo.txt'));
    hexo.config.exclude = [];

    // Skip render files
    hexo.config.skip_render = ['fff/**'];
    pattern.match('fff/foo.json').should.have.property('renderable', false);
    hexo.config.skip_render = [];
  });

  it('asset - type: create', async () => {
    const file = newFile({
      path: 'foo.jpg',
      type: 'create',
      renderable: false
    });

    await writeFile(file.source, 'foo');
    await process(file);
    const id = 'source/' + file.path;
    const asset = Asset.findById(id);

    asset._id.should.eql(id);
    asset.path.should.eql(file.path);
    asset.modified.should.be.true;
    asset.renderable.should.be.false;

    return Promise.all([
      asset.remove(),
      unlink(file.source)
    ]);
  });

  it('asset - type: create (when source path is configed to parent directory)', async () => {
    const file = newFile({
      path: '../../source/foo.jpg',
      type: 'create',
      renderable: false
    });

    await writeFile(file.source, 'foo');
    await process(file);
    const id = '../source/foo.jpg'; // The id should a relative path,because the 'lib/models/assets.js' use asset path by joining base path with "_id" directly.
    const asset = Asset.findById(id);
    asset._id.should.eql(id);
    asset.path.should.eql(file.path);
    asset.modified.should.be.true;
    asset.renderable.should.be.false;

    asset.remove();
    await unlink(file.source);
    rmdir(dirname(file.source));
  });

  it('asset - type: update', async () => {
    const file = newFile({
      path: 'foo.jpg',
      type: 'update',
      renderable: false
    });

    const id = 'source/' + file.path;

    await Promise.all([
      writeFile(file.source, 'test'),
      Asset.insert({
        _id: id,
        path: file.path,
        modified: false
      })
    ]);
    await process(file);
    const asset = Asset.findById(id);

    asset._id.should.eql(id);
    asset.path.should.eql(file.path);
    asset.modified.should.be.true;
    asset.renderable.should.be.false;

    return Promise.all([
      asset.remove(),
      unlink(file.source)
    ]);
  });

  it('asset - type: skip', async () => {
    const file = newFile({
      path: 'foo.jpg',
      type: 'skip',
      renderable: false
    });

    const id = 'source/' + file.path;

    await Promise.all([
      writeFile(file.source, 'test'),
      Asset.insert({
        _id: id,
        path: file.path,
        modified: false
      })
    ]);
    await process(file);
    const asset = Asset.findById(id);
    asset.modified.should.be.false;
    await Promise.all([
      Asset.removeById(id),
      unlink(file.source)
    ]);
  });

  it('asset - type: delete', async () => {
    const file = newFile({
      path: 'foo.jpg',
      type: 'delete',
      renderable: false
    });

    const id = 'source/' + file.path;

    await Asset.insert({
      _id: id,
      path: file.path
    });
    await process(file);

    should.not.exist(Asset.findById(id));
  });

  it('asset - type: delete - not exist', async () => {
    const file = newFile({
      path: 'foo.jpg',
      type: 'delete',
      renderable: false
    });

    const id = 'source/' + file.path;
    await process(file);

    should.not.exist(Asset.findById(id));
  });

  it('page - type: create', async () => {
    const body = [
      'title: "Hello world"',
      'date: 2006-01-02 15:04:05',
      'updated: 2014-12-13 01:02:03',
      '---',
      'The quick brown fox jumps over the lazy dog'
    ].join('\n');

    const file = newFile({
      path: 'hello.njk',
      type: 'create',
      renderable: true
    });

    await writeFile(file.source, body);
    await process(file);

    const page = Page.findOne({ source: file.path });
    page.title.should.eql('Hello world');
    page.date.format(dateFormat).should.eql('2006-01-02 15:04:05');
    page.updated.format(dateFormat).should.eql('2014-12-13 01:02:03');
    page._content.should.eql('The quick brown fox jumps over the lazy dog');
    page.source.should.eql(file.path);
    page.raw.should.eql(body);
    page.path.should.eql('hello.html');
    page.layout.should.eql('page');

    await Promise.all([
      page.remove(),
      unlink(file.source)
    ]);
  });

  it('page - type: create - exist', async () => {
    const logSpy = spy();
    hexo.log.warn = logSpy;

    const body = [
      'title: "Hello world"',
      'date: 2006-01-02 15:04:05',
      'updated: 2014-12-13 01:02:03',
      '---',
      'The quick brown fox jumps over the lazy dog'
    ].join('\n');

    const file = newFile({
      path: 'hello.njk',
      type: 'create',
      renderable: true
    });

    await writeFile(file.source, body);
    await process(file);
    await process(file);

    const page = Page.findOne({ source: file.path });
    page.title.should.eql('Hello world');
    page.date.format(dateFormat).should.eql('2006-01-02 15:04:05');
    page.updated.format(dateFormat).should.eql('2014-12-13 01:02:03');
    page._content.should.eql('The quick brown fox jumps over the lazy dog');
    page.source.should.eql(file.path);
    page.raw.should.eql(body);
    page.path.should.eql('hello.html');
    page.layout.should.eql('page');

    logSpy.called.should.be.true;
    logSpy.args[0][0].should.contains('Trying to "create" \x1B[35mhello.njk\x1B[39m, but the file already exists!');
    await Promise.all([
      page.remove(),
      unlink(file.source)
    ]);
  });

  it('page - type: update', async () => {
    const body = [
      'title: "Hello world"',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'hello.njk',
      type: 'update',
      renderable: true
    });


    const doc = await Page.insert({ source: file.path, path: 'hello.html' });
    await writeFile(file.source, body);
    const id = doc._id;
    await process(file);
    const page = Page.findOne({ source: file.path });
    page._id.should.eql(id);
    page.title.should.eql('Hello world');

    await Promise.all([
      page.remove(),
      unlink(file.source)
    ]);
  });

  it('page - type: skip', async () => {
    const file = newFile({
      path: 'hello.njk',
      type: 'skip',
      renderable: true
    });

    await Page.insert({
      source: file.path,
      path: 'hello.html'
    });
    const page = Page.findOne({source: file.path});
    await process(file);
    should.exist(page);
    await Promise.all([
      page.remove()
    ]);
  });

  it('page - type: delete', async () => {
    const file = newFile({
      path: 'hello.njk',
      type: 'delete',
      renderable: true
    });

    await Page.insert({
      source: file.path,
      path: 'hello.html'
    });
    await process(file);
    should.not.exist(Page.findOne({ source: file.path }));
  });

  it('page - type: delete - not exist', async () => {
    const file = newFile({
      path: 'hello.njk',
      type: 'delete',
      renderable: true
    });

    await process(file);
    should.not.exist(Page.findOne({ source: file.path }));
  });

  it('page - use the status of the source file if date not set', async () => {
    const file = newFile({
      path: 'hello.njk',
      type: 'create',
      renderable: true
    });

    await writeFile(file.source, '');
    await process(file);
    const stats = await stat(file.source);
    const page = Page.findOne({source: file.path});

    page.date.toDate().should.eql(stats.ctime);
    page.updated.toDate().should.eql(stats.mtime);

    await Promise.all([
      page.remove(),
      unlink(file.source)
    ]);
  });

  it('page - use the date for updated if updated_option = date', async () => {
    const body = [
      'date: 2011-4-5 14:19:19',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'hello.njk',
      type: 'create',
      renderable: true
    });

    hexo.config.updated_option = 'date';

    await writeFile(file.source, body);
    await process(file);
    const stats = await stat(file.source);
    const page = Page.findOne({source: file.path});

    page.updated.toDate().should.eql(page.date.toDate());
    page.updated.toDate().should.not.eql(stats.mtime);

    await Promise.all([
      page.remove(),
      unlink(file.source)
    ]);
  });

  it('page - use the status if updated_option = mtime', async () => {
    const file = newFile({
      path: 'hello.njk',
      type: 'create',
      renderable: true
    });

    hexo.config.updated_option = 'mtime';

    await writeFile(file.source, '');
    await process(file);
    const stats = await stat(file.source);
    const page = Page.findOne({source: file.path});

    page.date.toDate().should.eql(stats.ctime);
    page.updated.toDate().should.eql(stats.mtime);

    await Promise.all([
      page.remove(),
      unlink(file.source)
    ]);
  });

  it('page - updated shouldn\'t exists if updated_option = empty', async () => {
    const file = newFile({
      path: 'hello.njk',
      type: 'create',
      renderable: true
    });

    hexo.config.updated_option = 'empty';

    await writeFile(file.source, '');
    await process(file);
    const stats = await stat(file.source);
    const page = Page.findOne({source: file.path});

    page.date.toDate().should.eql(stats.ctime);
    should.not.exist(page.updated);

    await Promise.all([
      page.remove(),
      unlink(file.source)
    ]);
  });

  it('page - permalink', async () => {
    const body = [
      'title: "Hello world"',
      'permalink: foo.html',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'hello.njk',
      type: 'create',
      renderable: true
    });

    await writeFile(file.source, body);
    await process(file);
    const page = Page.findOne({ source: file.path });
    page.path.should.eql('foo.html');

    await Promise.all([
      page.remove(),
      unlink(file.source)
    ]);
  });

  it('page - permalink (without extension name)', async () => {
    const body = [
      'title: "Hello world"',
      'permalink: foo',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'hello.njk',
      type: 'create',
      renderable: true
    });

    await writeFile(file.source, body);
    await process(file);
    const page = Page.findOne({ source: file.path });
    page.path.should.eql('foo.html');

    await Promise.all([
      page.remove(),
      unlink(file.source)
    ]);
  });

  it('page - permalink (with trailing slash)', async () => {
    const body = [
      'title: "Hello world"',
      'permalink: foo/',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'hello.njk',
      type: 'create',
      renderable: true
    });

    await writeFile(file.source, body);
    await process(file);
    const page = Page.findOne({ source: file.path });
    page.path.should.eql('foo/index.html');

    await Promise.all([
      page.remove(),
      unlink(file.source)
    ]);
  });

  it('page - set layout to false if output is not html', async () => {
    const body = 'foo: 1';

    const file = newFile({
      path: 'test.yml',
      type: 'create',
      renderable: true
    });

    await writeFile(file.source, body);
    await process(file);
    const page = Page.findOne({ source: file.path });
    page.layout.should.eql('false');

    await Promise.all([
      page.remove(),
      unlink(file.source)
    ]);
  });

  it('page - don\'t set layout to false if layout is set but output is not html', async () => {
    const body = [
      'layout: something',
      '---',
      'foo: 1'
    ].join('\n');

    const file = newFile({
      path: 'test.yml',
      type: 'create',
      renderable: true
    });

    await writeFile(file.source, body);
    await process(file);
    const page = Page.findOne({ source: file.path });
    page.layout.should.eql('something');

    await Promise.all([
      page.remove(),
      unlink(file.source)
    ]);
  });

  it('page - parse date', async () => {
    const body = [
      'title: "Hello world"',
      'date: Apr 24 2014',
      'updated: May 5 2015',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'hello.njk',
      type: 'create',
      renderable: true
    });

    await writeFile(file.source, body);
    await process(file);
    const page = Page.findOne({ source: file.path });
    page.date.format(dateFormat).should.eql('2014-04-24 00:00:00');
    page.updated.format(dateFormat).should.eql('2015-05-05 00:00:00');

    await Promise.all([
      page.remove(),
      unlink(file.source)
    ]);
  });

  it('page - use file stats instead if date is invalid', async () => {
    const body = [
      'title: "Hello world"',
      'date: yomama',
      'updated: isfat',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'hello.njk',
      type: 'create',
      renderable: true
    });

    await writeFile(file.source, body);
    await process(file);
    const stats = await file.stat();
    const page = Page.findOne({source: file.path});

    page.date.toDate().should.eql(stats.ctime);
    page.updated.toDate().should.eql(page.date.toDate());

    await Promise.all([
      page.remove(),
      unlink(file.source)
    ]);
  });

  it('page - don\'t remove extension name', async () => {
    const body = '';

    const file = newFile({
      path: 'test.min.js',
      type: 'create',
      renderable: true
    });

    await writeFile(file.source, body);
    await process(file);
    const page = Page.findOne({ source: file.path });
    page.path.should.eql('test.min.js');

    await Promise.all([
      page.remove(),
      unlink(file.source)
    ]);
  });

  it('page - timezone', async () => {
    const body = [
      'title: "Hello world"',
      'date: Apr 24 2014',
      'updated: May 5 2015',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'hello.njk',
      type: 'create',
      renderable: true
    });

    hexo.config.timezone = 'UTC';

    await writeFile(file.source, body);
    await process(file);
    const page = Page.findOne({source: file.path});

    page.date.utc().format(dateFormat).should.eql('2014-04-24 00:00:00');
    page.updated.utc().format(dateFormat).should.eql('2015-05-05 00:00:00');

    await Promise.all([
      page.remove(),
      unlink(file.source)
    ]);
  });
});
