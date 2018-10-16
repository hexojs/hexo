const should = require('chai').should(); // eslint-disable-line strict
const pathFn = require('path');
const fs = require('hexo-fs');
const Promise = require('bluebird');

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

describe('asset', () => {
  const Hexo = require('../../../lib/hexo');
  const baseDir = pathFn.join(__dirname, 'asset_test');
  const hexo = new Hexo(baseDir);
  const asset = require('../../../lib/plugins/processor/asset')(hexo);
  const process = asset.process.bind(hexo);
  const pattern = asset.pattern;
  const source = hexo.source;
  const File = source.File;
  const Asset = hexo.model('Asset');
  const Page = hexo.model('Page');

  function newFile(options) {
    options.source = pathFn.join(source.base, options.path);
    options.params = {
      renderable: options.renderable
    };

    return new File(options);
  }

  before(() => fs.mkdirs(baseDir).then(() => hexo.init()));

  after(() => fs.rmdir(baseDir));

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

  it('asset - type: create', () => {
    const file = newFile({
      path: 'foo.jpg',
      type: 'create',
      renderable: false
    });

    return fs.writeFile(file.source, 'foo').then(() => process(file)).then(() => {
      const id = 'source/' + file.path;
      const asset = Asset.findById(id);

      asset._id.should.eql(id);
      asset.path.should.eql(file.path);
      asset.modified.should.be.true;
      asset.renderable.should.be.false;

      return asset.remove();
    }).finally(() => fs.unlink(file.source));
  });

  it('asset - type: update', () => {
    const file = newFile({
      path: 'foo.jpg',
      type: 'update',
      renderable: false
    });

    const id = 'source/' + file.path;

    return Promise.all([
      fs.writeFile(file.source, 'test'),
      Asset.insert({
        _id: id,
        path: file.path,
        modified: false
      })
    ]).then(() => process(file)).then(() => {
      const asset = Asset.findById(id);

      asset._id.should.eql(id);
      asset.path.should.eql(file.path);
      asset.modified.should.be.true;
      asset.renderable.should.be.false;

      return asset.remove();
    }).finally(() => fs.unlink(file.source));
  });

  it('asset - type: skip', () => {
    const file = newFile({
      path: 'foo.jpg',
      type: 'skip',
      renderable: false
    });

    const id = 'source/' + file.path;

    return Promise.all([
      fs.writeFile(file.source, 'test'),
      Asset.insert({
        _id: id,
        path: file.path,
        modified: false
      })
    ]).then(() => process(file)).then(() => {
      const asset = Asset.findById(id);
      asset.modified.should.be.false;
    }).finally(() => Promise.all([
      Asset.removeById(id),
      fs.unlink(file.source)
    ]));
  });

  it('asset - type: delete', () => {
    const file = newFile({
      path: 'foo.jpg',
      type: 'delete',
      renderable: false
    });

    const id = 'source/' + file.path;

    return Asset.insert({
      _id: id,
      path: file.path
    }).then(() => process(file)).then(() => {
      should.not.exist(Asset.findById(id));
    });
  });

  it('page - type: create', () => {
    const body = [
      'title: "Hello world"',
      'date: 2006-01-02 15:04:05',
      'updated: 2014-12-13 01:02:03',
      '---',
      'The quick brown fox jumps over the lazy dog'
    ].join('\n');

    const file = newFile({
      path: 'hello.swig',
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const page = Page.findOne({source: file.path});

      page.title.should.eql('Hello world');
      page.date.format(dateFormat).should.eql('2006-01-02 15:04:05');
      page.updated.format(dateFormat).should.eql('2014-12-13 01:02:03');
      page._content.should.eql('The quick brown fox jumps over the lazy dog');
      page.source.should.eql(file.path);
      page.raw.should.eql(body);
      page.path.should.eql('hello.html');
      page.layout.should.eql('page');

      return Promise.all([
        page.remove(),
        fs.unlink(file.source)
      ]);
    });
  });

  it('page - type: update', () => {
    const body = [
      'title: "Hello world"',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'hello.swig',
      type: 'update',
      renderable: true
    });

    let id;

    return Promise.all([
      Page.insert({source: file.path, path: 'hello.html'}),
      fs.writeFile(file.source, body)
    ]).spread(doc => {
      id = doc._id;
      return process(file);
    }).then(() => {
      const page = Page.findOne({source: file.path});

      page._id.should.eql(id);
      page.title.should.eql('Hello world');

      return Promise.all([
        page.remove(),
        fs.unlink(file.source)
      ]);
    });
  });

  it('page - type: delete', () => {
    const file = newFile({
      path: 'hello.swig',
      type: 'delete',
      renderable: true
    });

    return Page.insert({
      source: file.path,
      path: 'hello.html'
    }).then(() => process(file)).then(() => {
      should.not.exist(Page.findOne({source: file.path}));
    });
  });

  it('page - use the status of the source file if date not set', () => {
    const file = newFile({
      path: 'hello.swig',
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, '').then(() => Promise.all([
      fs.stat(file.source),
      process(file)
    ])).spread(stats => {
      const page = Page.findOne({source: file.path});

      page.date.toDate().should.eql(stats.ctime);
      page.updated.toDate().should.eql(stats.mtime);

      return Promise.all([
        page.remove(),
        fs.unlink(file.source)
      ]);
    });
  });

  it('page - permalink', () => {
    const body = [
      'title: "Hello world"',
      'permalink: foo.html',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'hello.swig',
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const page = Page.findOne({source: file.path});

      page.path.should.eql('foo.html');

      return Promise.all([
        page.remove(),
        fs.unlink(file.source)
      ]);
    });
  });

  it('page - permalink (without extension name)', () => {
    const body = [
      'title: "Hello world"',
      'permalink: foo',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'hello.swig',
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const page = Page.findOne({source: file.path});

      page.path.should.eql('foo.html');

      return Promise.all([
        page.remove(),
        fs.unlink(file.source)
      ]);
    });
  });

  it('page - permalink (with trailing slash)', () => {
    const body = [
      'title: "Hello world"',
      'permalink: foo/',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'hello.swig',
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const page = Page.findOne({source: file.path});

      page.path.should.eql('foo/index.html');

      return Promise.all([
        page.remove(),
        fs.unlink(file.source)
      ]);
    });
  });

  it('page - set layout to false if output is not html', () => {
    const body = 'foo: 1';

    const file = newFile({
      path: 'test.yml',
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const page = Page.findOne({source: file.path});

      page.layout.should.eql('false');

      return Promise.all([
        page.remove(),
        fs.unlink(file.source)
      ]);
    });
  });

  it('page - don\'t set layout to false if layout is set but output is not html', () => {
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

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const page = Page.findOne({source: file.path});

      page.layout.should.eql('something');

      return Promise.all([
        page.remove(),
        fs.unlink(file.source)
      ]);
    });
  });

  it('page - parse date', () => {
    const body = [
      'title: "Hello world"',
      'date: Apr 24 2014',
      'updated: May 5 2015',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'hello.swig',
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const page = Page.findOne({source: file.path});

      page.date.format(dateFormat).should.eql('2014-04-24 00:00:00');
      page.updated.format(dateFormat).should.eql('2015-05-05 00:00:00');

      return Promise.all([
        page.remove(),
        fs.unlink(file.source)
      ]);
    });
  });

  it('page - use file stats instead if date is invalid', () => {
    const body = [
      'title: "Hello world"',
      'date: yomama',
      'updated: isfat',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'hello.swig',
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => Promise.all([
      file.stat(),
      process(file)
    ])).spread(stats => {
      const page = Page.findOne({source: file.path});

      page.date.toDate().should.eql(stats.ctime);
      page.updated.toDate().should.eql(stats.mtime);

      return Promise.all([
        page.remove(),
        fs.unlink(file.source)
      ]);
    });
  });

  it('page - don\'t remove extension name', () => {
    const body = '';

    const file = newFile({
      path: 'test.min.js',
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const page = Page.findOne({source: file.path});

      page.path.should.eql('test.min.js');

      return Promise.all([
        page.remove(),
        fs.unlink(file.source)
      ]);
    });
  });

  it('page - timezone', () => {
    const body = [
      'title: "Hello world"',
      'date: Apr 24 2014',
      'updated: May 5 2015',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'hello.swig',
      type: 'create',
      renderable: true
    });

    hexo.config.timezone = 'UTC';

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const page = Page.findOne({source: file.path});

      page.date.utc().format(dateFormat).should.eql('2014-04-24 00:00:00');
      page.updated.utc().format(dateFormat).should.eql('2015-05-05 00:00:00');

      return Promise.all([
        page.remove(),
        fs.unlink(file.source)
      ]);
    }).finally(() => {
      hexo.config.timezone = '';
    });
  });
});
