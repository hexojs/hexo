'use strict';

const pathFn = require('path');
const fs = require('hexo-fs');
const Promise = require('bluebird');
const sinon = require('sinon');
const sep = pathFn.sep;
const testUtil = require('../../util');
const { full_url_for } = require('hexo-util');

describe('Hexo', () => {
  const base_dir = pathFn.join(__dirname, 'hexo_test');
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(base_dir, {silent: true});
  const coreDir = pathFn.join(__dirname, '../../..');
  const version = require('../../../package.json').version;
  const Post = hexo.model('Post');
  const Page = hexo.model('Page');
  const Data = hexo.model('Data');
  const route = hexo.route;

  function checkStream(stream, expected) {
    return testUtil.stream.read(stream).then(data => {
      data.should.eql(expected);
    });
  }

  function loadAssetGenerator() {
    hexo.extend.generator.register('asset', require('../../../lib/plugins/generator/asset'));
  }

  before(() => fs.mkdirs(hexo.base_dir).then(() => hexo.init()));

  beforeEach(() => {
    // Unregister all generators
    hexo.extend.generator.store = {};
    // Remove all routes
    route.routes = {};
  });

  after(() => fs.rmdir(hexo.base_dir));

  hexo.extend.console.register('test', args => args);

  it('constructor', () => {
    const hexo = new Hexo(__dirname);

    /* eslint-disable no-path-concat */
    hexo.core_dir.should.eql(coreDir + sep);
    hexo.lib_dir.should.eql(pathFn.join(coreDir, 'lib') + sep);
    hexo.version.should.eql(version);
    hexo.base_dir.should.eql(__dirname + sep);
    hexo.public_dir.should.eql(pathFn.join(__dirname, 'public') + sep);
    hexo.source_dir.should.eql(pathFn.join(__dirname, 'source') + sep);
    hexo.plugin_dir.should.eql(pathFn.join(__dirname, 'node_modules') + sep);
    hexo.script_dir.should.eql(pathFn.join(__dirname, 'scripts') + sep);
    hexo.scaffold_dir.should.eql(pathFn.join(__dirname, 'scaffolds') + sep);
    /* eslint-enable no-path-concat */
    hexo.env.should.eql({
      args: {},
      debug: false,
      safe: false,
      silent: false,
      env: process.env.NODE_ENV || 'development',
      version,
      cmd: '',
      init: false
    });
    hexo.config_path.should.eql(pathFn.join(__dirname, '_config.yml'));
  });

  it('constructs mutli-config', () => {
    const configs = ['../../../fixtures/_config.json', '../../../fixtures/_config.json'];
    const args = { _: [], config: configs.join(',') };
    const hexo = new Hexo(base_dir, args);
    hexo.config_path.should.eql(pathFn.join(base_dir, '_multiconfig.yml'));
  });

  // Issue #3964
  it('theme_config - deep clone', () => {
    const hexo = new Hexo(__dirname);
    hexo.theme.config = { a: { b: 1, c: 2 } };
    hexo.config.theme_config = { a: { b: 3 } };
    const Locals = hexo._generateLocals();
    const { theme } = new Locals();

    Object.prototype.hasOwnProperty.call(theme.a, 'c').should.eql(true);
    theme.a.b.should.eql(3);
  });

  it('theme_config - null theme.config', () => {
    const hexo = new Hexo(__dirname);
    hexo.theme.config = null;
    hexo.config.theme_config = { c: 3 };
    const Locals = hexo._generateLocals();
    const { theme } = new Locals();

    Object.prototype.hasOwnProperty.call(theme, 'c').should.eql(true);
    theme.c.should.eql(3);
  });

  it('call()', () => hexo.call('test', {foo: 'bar'}).then(data => {
    data.should.eql({foo: 'bar'});
  }));

  it('call() - callback', callback => {
    hexo.call('test', {foo: 'bar'}, (err, data) => {
      should.not.exist(err);
      data.should.eql({foo: 'bar'});

      callback();
    });
  });

  it('call() - callback without args', callback => {
    hexo.call('test', (err, data) => {
      should.not.exist(err);
      data.should.eql({});

      callback();
    });
  });

  it('call() - console not registered', () => {
    const errorCallback = sinon.spy(err => {
      err.should.have.property('message', 'Console `nothing` has not been registered yet!');
    });

    return hexo.call('nothing').catch(errorCallback).finally(() => {
      errorCallback.calledOnce.should.be.true;
    });
  });

  it('init()', () => {
    const hexo = new Hexo(pathFn.join(__dirname, 'hexo_test'), {silent: true});
    const hook = sinon.spy();

    hexo.extend.filter.register('after_init', hook);

    return hexo.init().then(() => {
      hook.calledOnce.should.be.true;
    });
  });

  // it('model()'); missing-unit-test

  it('_showDrafts()', () => {
    hexo._showDrafts().should.be.false;

    hexo.env.args.draft = true;
    hexo._showDrafts().should.be.true;
    hexo.env.args.draft = false;

    hexo.env.args.drafts = true;
    hexo._showDrafts().should.be.true;
    hexo.env.args.drafts = false;

    hexo.config.render_drafts = true;
    hexo._showDrafts().should.be.true;
    hexo.config.render_drafts = false;
  });

  function testLoad(path) {
    const target = pathFn.join(path, 'test.txt');
    const body = 'test';

    loadAssetGenerator();

    return fs.writeFile(target, body).then(() => hexo.load()).then(() => checkStream(route.get('test.txt'), body)).then(() => fs.unlink(target));
  }

  it('load() - source', () => testLoad(hexo.source_dir));

  it('load() - theme', () => testLoad(pathFn.join(hexo.theme_dir, 'source')));

  function testWatch(path) {
    const target = pathFn.join(path, 'test.txt');
    const body = 'test';
    const newBody = body + body;

    loadAssetGenerator();

    return fs.writeFile(target, body).then(() => hexo.watch()).then(() => // Test for first generation
      checkStream(route.get('test.txt'), body)).then(() => // Update the file
      fs.writeFile(target, newBody)).delay(300).then(() => // Check the new route
      checkStream(route.get('test.txt'), newBody)).then(() => // Stop watching
      hexo.unwatch()).then(() => // Delete the file
      fs.unlink(target));
  }

  it('watch() - source', () => testWatch(hexo.source_dir));

  it('watch() - theme', () => testWatch(pathFn.join(hexo.theme_dir, 'source')));

  // it('unwatch()'); missing-unit-test

  it('exit()', () => {
    const hook = sinon.spy();
    const listener = sinon.spy();

    hexo.extend.filter.register('before_exit', hook);
    hexo.once('exit', listener);

    return hexo.exit().then(() => {
      hook.calledOnce.should.be.true;
      listener.calledOnce.should.be.true;
    });
  });

  it('exit() - error handling - callback', callback => {
    hexo.once('exit', err => {
      err.should.eql({foo: 'bar'});
      callback();
    });

    hexo.exit({foo: 'bar'});
  });

  it('exit() - error handling - promise', () => {
    return Promise.all([
      hexo.exit({foo: 'bar'}),
      new Promise((resolve, reject) => {
        hexo.once('exit', err => {
          try {
            err.should.eql({foo: 'bar'});
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      })
    ]);
  });

  it('draft visibility', () => Post.insert([
    {source: 'foo', slug: 'foo', published: true},
    {source: 'bar', slug: 'bar', published: false}
  ]).then(posts => {
    hexo.locals.invalidate();
    hexo.locals.get('posts').toArray().should.eql(posts.slice(0, 1));

    // draft visible
    hexo.config.render_drafts = true;
    hexo.locals.invalidate();
    hexo.locals.get('posts').toArray().should.eql(posts);
    hexo.config.render_drafts = false;

    return posts;
  }).map(post => Post.removeById(post._id)));

  it('future posts', () => Post.insert([
    {source: 'foo', slug: 'foo', date: Date.now() - 3600},
    {source: 'bar', slug: 'bar', date: Date.now() + 3600}
  ]).then(posts => {
    function mapper(post) {
      return post._id;
    }

    // future on
    hexo.config.future = true;
    hexo.locals.invalidate();
    hexo.locals.get('posts').map(mapper).should.eql(posts.map(mapper));

    // future off
    hexo.config.future = false;
    hexo.locals.invalidate();
    hexo.locals.get('posts').map(mapper).should.eql([posts[0]._id]);

    return posts;
  }).map(post => Post.removeById(post._id)));

  it('future pages', () => Page.insert([
    {source: 'foo', path: 'foo', date: Date.now() - 3600},
    {source: 'bar', path: 'bar', date: Date.now() + 3600}
  ]).then(pages => {
    function mapper(page) {
      return page._id;
    }

    // future on
    hexo.config.future = true;
    hexo.locals.invalidate();
    hexo.locals.get('pages').map(mapper).should.eql(pages.map(mapper));

    // future off
    hexo.config.future = false;
    hexo.locals.invalidate();
    hexo.locals.get('pages').map(mapper).should.eql([pages[0]._id]);

    return pages;
  }).map(page => Page.removeById(page._id)));

  it('locals.data', () => Data.insert([
    {_id: 'users', data: {foo: 1}},
    {_id: 'comments', data: {bar: 2}}
  ]).then(data => {
    hexo.locals.invalidate();
    hexo.locals.get('data').should.eql({
      users: {foo: 1},
      comments: {bar: 2}
    });

    return data;
  }).map(data => data.remove()));

  it('_generate()', () => {
    // object
    hexo.extend.generator.register('test_obj', locals => {
      locals.test.should.eql('foo');

      return {
        path: 'foo',
        data: 'foo'
      };
    });

    // array
    hexo.extend.generator.register('test_arr', locals => {
      locals.test.should.eql('foo');

      return [
        {path: 'bar', data: 'bar'},
        {path: 'baz', data: 'baz'}
      ];
    });

    const beforeListener = sinon.spy();
    const afterListener = sinon.spy();
    const afterHook = sinon.spy();

    const beforeHook = sinon.spy(() => {
      hexo.locals.set('test', 'foo');
    });

    hexo.once('generateBefore', beforeListener);
    hexo.once('generateAfter', afterListener);
    hexo.extend.filter.register('before_generate', beforeHook);
    hexo.extend.filter.register('after_generate', afterHook);

    return hexo._generate().then(() => {
      route.list().should.eql(['foo', 'bar', 'baz']);

      beforeListener.calledOnce.should.be.true;
      afterListener.calledOnce.should.be.true;
      beforeHook.calledOnce.should.be.true;
      afterHook.calledOnce.should.be.true;

      return Promise.all([
        checkStream(route.get('foo'), 'foo'),
        checkStream(route.get('bar'), 'bar'),
        checkStream(route.get('baz'), 'baz')
      ]);
    });
  });

  it('_generate() - layout', () => {
    hexo.theme.setView('test.swig', [
      '{{ config.title }}',
      '{{ page.foo }}',
      '{{ layout }}',
      '{{ view_dir }}'
    ].join('\n'));

    hexo.extend.generator.register('test', () => ({
      path: 'test',
      layout: 'test',

      data: {
        foo: 'bar'
      }
    }));

    const expected = [
      hexo.config.title,
      'bar',
      'layout',
      pathFn.join(hexo.theme_dir, 'layout') + pathFn.sep
    ].join('\n');

    return hexo._generate().then(() => checkStream(route.get('test'), expected));
  });

  it('_generate() - layout array', () => {
    hexo.theme.setView('baz.swig', 'baz');

    hexo.extend.generator.register('test', () => ({
      path: 'test',
      layout: ['foo', 'bar', 'baz']
    }));

    return hexo._generate().then(() => checkStream(route.get('test'), 'baz'));
  });

  it('_generate() - layout not exist', () => {
    hexo.extend.generator.register('test', () => ({
      path: 'test',
      layout: 'nothing'
    }));

    return hexo._generate().then(() => checkStream(route.get('test'), ''));
  });

  it('_generate() - remove old routes', () => {
    hexo.extend.generator.register('test', () => ({
      path: 'bar',
      data: 'newbar'
    }));

    route.set('foo', 'foo');
    route.set('bar', 'bar');
    route.set('baz', 'baz');

    return hexo._generate().then(() => {
      should.not.exist(route.get('foo'));
      should.not.exist(route.get('baz'));

      return checkStream(route.get('bar'), 'newbar');
    });
  });

  it('_generate() - return nothing in generator', () => {
    hexo.extend.generator.register('test_nothing', () => {
      //
    });

    hexo.extend.generator.register('test_normal', () => ({
      path: 'bar',
      data: 'bar'
    }));

    return hexo._generate().then(() => checkStream(route.get('bar'), 'bar'));
  });

  it('_generate() - validate locals', () => {
    hexo.theme.setView('test.swig', [
      '{{ path }}',
      '{{ url }}',
      '{{ view_dir }}'
    ].join('\n'));

    hexo.extend.generator.register('test', () => ({
      path: 'test',
      layout: 'test'
    }));

    return hexo._generate().then(() => checkStream(route.get('test'), [
      'test',
      hexo.config.url + '/test',
      pathFn.join(hexo.theme_dir, 'layout') + pathFn.sep
    ].join('\n')));
  });

  it('_generate() - should encode url', () => {
    const path = 'bár';
    hexo.config.url = 'http://fôo.com';

    hexo.theme.setView('test.swig', '{{ url }}');

    hexo.extend.generator.register('test', () => ({
      path,
      layout: 'test'
    }));

    return hexo._generate().then(() => checkStream(route.get(path),
      full_url_for.call(hexo, path)));
  });

  it('_generate() - do nothing if it\'s generating', () => {
    const spy = sinon.spy();
    hexo.extend.generator.register('test', spy);

    hexo._isGenerating = true;
    hexo._generate();
    spy.called.should.be.false;
    hexo._isGenerating = false;
  });

  it('_generate() - reset cache for new route', () => {
    let count = 0;

    hexo.theme.setView('test.swig', '{{ page.count() }}');

    hexo.extend.generator.register('test', () => ({
      path: 'test',
      layout: 'test',
      data: {count: () => count++}
    }));

    // First generation
    return hexo._generate({cache: true})
      .then(() => checkStream(route.get('test'), '0'))
      .then(() => checkStream(route.get('test'), '0')) // should return cached result
      .then(() => hexo._generate({cache: true})) // Second generation
      .then(() => checkStream(route.get('test'), '1'))
      .then(() => checkStream(route.get('test'), '1')); // should return cached result
  });

  it('_generate() - cache disabled and use new route', () => {
    let count = 0;

    hexo.theme.setView('test.swig', '{{ page.count() }}');

    hexo.extend.generator.register('test', () => ({
      path: 'test',
      layout: 'test',
      data: {count: () => count++}
    }));

    // First generation
    return hexo._generate({cache: false})
      .then(() => checkStream(route.get('test'), '0'))
      .then(() => checkStream(route.get('test'), '1'))
      .then(() => hexo._generate({cache: false})) // Second generation
      .then(() => checkStream(route.get('test'), '2'))
      .then(() => checkStream(route.get('test'), '3'));
  });

  it('_generate() - cache disabled & update template', () => {
    hexo.theme.setView('test.swig', '0');

    hexo.extend.generator.register('test', () => ({
      path: 'test',
      layout: 'test'
    }));

    return hexo._generate({cache: false})
      .then(() => checkStream(route.get('test'), '0'))
      .then(() => hexo.theme.setView('test.swig', '1'))
      .then(() => checkStream(route.get('test'), '1'));
  });

  it('_generate() - cache enabled & update template', () => {
    hexo.theme.setView('test.swig', '0');

    hexo.extend.generator.register('test', () => ({
      path: 'test',
      layout: 'test'
    }));

    return hexo._generate({cache: true})
      .then(() => checkStream(route.get('test'), '0'))
      .then(() => hexo.theme.setView('test.swig', '1'))
      .then(() => checkStream(route.get('test'), '0')); // should return cached result
  });

  it('execFilter()', () => {
    hexo.extend.filter.register('exec_test', data => {
      data.should.eql('');
      return data + 'foo';
    });

    return hexo.execFilter('exec_test', '').then(result => {
      result.should.eql('foo');
    });
  });

  it('execFilterSync()', () => {
    hexo.extend.filter.register('exec_sync_test', data => {
      data.should.eql('');
      return data + 'foo';
    });

    hexo.execFilterSync('exec_sync_test', '').should.eql('foo');
  });
});
