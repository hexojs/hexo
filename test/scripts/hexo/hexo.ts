import { sep, join } from 'path';
import { mkdirs, rmdir, unlink, writeFile } from 'hexo-fs';
import BluebirdPromise from 'bluebird';
import { spy } from 'sinon';
import { readStream } from '../../util';
import { full_url_for } from 'hexo-util';
import Hexo from '../../../lib/hexo';
import chai from 'chai';
const should = chai.should();

describe('Hexo', () => {
  const base_dir = join(__dirname, 'hexo_test');
  const hexo = new Hexo(base_dir, { silent: true });
  const coreDir = join(__dirname, '../../..');
  const { version } = require('../../../package.json');
  const Post = hexo.model('Post');
  const Page = hexo.model('Page');
  const Data = hexo.model('Data');
  const { route } = hexo;

  async function checkStream(stream, expected) {
    const data = await readStream(stream);
    data.should.eql(expected);
  }

  function loadAssetGenerator() {
    hexo.extend.generator.register('asset', require('../../../lib/plugins/generator/asset'));
  }

  before(async () => {
    await mkdirs(hexo.base_dir);
    await hexo.init();
  });

  beforeEach(() => {
    // Unregister all generators
    hexo.extend.generator.store = {};
    // Remove all routes
    route.routes = {};
  });

  after(() => rmdir(hexo.base_dir));

  hexo.extend.console.register('test', args => args);

  it('constructor', () => {
    const hexo = new Hexo(__dirname);

    /* eslint-disable no-path-concat */
    hexo.core_dir.should.eql(coreDir + sep);
    hexo.lib_dir.should.eql(join(coreDir, 'lib') + sep);
    hexo.version.should.eql(version);
    hexo.base_dir.should.eql(__dirname + sep);
    hexo.public_dir.should.eql(join(__dirname, 'public') + sep);
    hexo.source_dir.should.eql(join(__dirname, 'source') + sep);
    hexo.plugin_dir.should.eql(join(__dirname, 'node_modules') + sep);
    hexo.script_dir.should.eql(join(__dirname, 'scripts') + sep);
    hexo.scaffold_dir.should.eql(join(__dirname, 'scaffolds') + sep);
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
    hexo.config_path.should.eql(join(__dirname, '_config.yml'));
  });

  it('constructs multi-config', () => {
    const configs = ['../../../fixtures/_config.json', '../../../fixtures/_config.json'];
    const args = { _: [], config: configs.join(',') };
    const hexo = new Hexo(base_dir, args);
    hexo.config_path.should.eql(join(base_dir, '_multiconfig.yml'));
  });

  it('call()', async () => {
    const data = await hexo.call('test', {foo: 'bar'});
    data.should.eql({foo: 'bar'});
  });

  it('call() - callback', callback => {
    hexo.call('test', { foo: 'bar' }, (err, data) => {
      should.not.exist(err);
      data.should.eql({ foo: 'bar' });

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

  it('call() - console not registered', async () => {
    try {
      await hexo.call('nothing');
      should.fail('Return value must be rejected');
    } catch (err) {
      err.should.property('message', 'Console `nothing` has not been registered yet!');
    }
  });

  it('init()', async () => {
    const hexo = new Hexo(join(__dirname, 'hexo_test'), {silent: true});
    const hook = spy();

    hexo.extend.filter.register('after_init', hook);

    await hexo.init();
    hook.calledOnce.should.be.true;
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

  async function testLoad(path) {
    const target = join(path, 'test.txt');
    const body = 'test';

    loadAssetGenerator();

    await writeFile(target, body);
    await hexo.load();
    await checkStream(route.get('test.txt'), body);
    await unlink(target);
  }

  it('load() - source', async () => await testLoad(hexo.source_dir));

  it('load() - theme', async () => await testLoad(join(hexo.theme_dir, 'source')));


  it('load() - load database', async () => {
    hexo._dbLoaded = false;
    const dbPath = hexo.database.options.path;

    const fixture = {
      meta: {
        version: 1,
        warehouse: require('warehouse').version
      },
      models: {
        PostTag: [
          { _id: 'cuid111111111111111111113', post_id: 'cuid111111111111111111111', tag_id: 'cuid111111111111111111112' }
        ],
        Tag: [
          { _id: 'cuid111111111111111111112', name: 'foo' }
        ],
        Post: [
          { _id: 'cuid111111111111111111111', source: 'test', slug: 'test' }
        ]
      }
    };
    await writeFile(dbPath, JSON.stringify(fixture));
    await hexo.load();
    // check Model
    hexo.model('PostTag').toArray({lean: true}).length.should.eql(fixture.models.PostTag.length);
    hexo.model('Tag').toArray({lean: true}).length.should.eql(fixture.models.Tag.length);
    hexo.model('Post').toArray({lean: true}).length.should.eql(fixture.models.Post.length);
    hexo._binaryRelationIndex.post_tag.keyIndex.size.should.eql(1);
    hexo._binaryRelationIndex.post_tag.valueIndex.size.should.eql(1);
    await unlink(dbPath);
    // clean up
    await hexo.model('PostTag').removeById('cuid111111111111111111113');
    await hexo.model('Tag').removeById('cuid111111111111111111112');
    await hexo.model('Post').removeById('cuid111111111111111111111');
    hexo._binaryRelationIndex.post_tag.keyIndex.clear();
    hexo._binaryRelationIndex.post_tag.valueIndex.clear();
  });

  // Issue #3964
  it('load() - merge theme config - deep clone', async () => {
    const hexo = new Hexo(__dirname, { silent: true });
    hexo.theme.config = { a: { b: 1, c: 2 } };
    hexo.config.theme_config = { a: { b: 3 } };

    await hexo.load();

    const { config: themeConfig } = hexo.theme;

    themeConfig.a.should.have.own.property('c');
    themeConfig.a.b.should.eql(3);

    const Locals = hexo._generateLocals();
    const { theme: themeLocals } = new Locals('', {path: '', layout: [], data: {}});

    themeLocals.a.should.have.own.property('c');
    themeLocals.a.b.should.eql(3);
  });

  it('load() - merge theme config - null theme.config', async () => {
    const hexo = new Hexo(__dirname, { silent: true });
    hexo.theme.config = null;
    hexo.config.theme_config = { c: 3 };

    await hexo.load();

    const { config: themeConfig } = hexo.theme;

    themeConfig.should.have.own.property('c');
    themeConfig.c.should.eql(3);

    const Locals = hexo._generateLocals();
    const { theme: themeLocals } = new Locals('', {path: '', layout: [], data: {}});

    themeLocals.should.have.own.property('c');
    themeLocals.c.should.eql(3);
  });

  // Filters should be able to read the theme_config:
  //  - before_post_render
  //  - after_post_render
  //  - before_generate
  it('load() - merge theme config - filter', async () => {
    const hexo = new Hexo(__dirname, { silent: true });

    const validateThemeConfig = function() {
      this.theme.config.a.b.should.eql(3);
    };

    hexo.theme.config = { a: { b: 1, c: 2 } };
    hexo.config.theme_config = { a: { b: 3 } };

    hexo.extend.filter.register('before_post_render', validateThemeConfig);
    hexo.extend.filter.register('after_post_render', validateThemeConfig);
    hexo.extend.filter.register('before_generate', validateThemeConfig);

    await hexo.load();

    hexo.extend.filter.unregister('before_post_render', validateThemeConfig);
    hexo.extend.filter.unregister('after_post_render', validateThemeConfig);
    hexo.extend.filter.unregister('before_generate', validateThemeConfig);
  });

  async function testWatch(path) {
    const target = join(path, 'test.txt');
    const body = 'test';
    const newBody = body + body;

    loadAssetGenerator();

    await writeFile(target, body);
    await hexo.watch();
    await checkStream(route.get('test.txt'), body); // Test for first generation
    await writeFile(target, newBody); // Update the file
    await BluebirdPromise.delay(300);
    await checkStream(route.get('test.txt'), newBody); // Check the new route
    hexo.unwatch(); // Stop watching
    await unlink(target); // Delete the file
  }

  it('watch() - source', async () => await testWatch(hexo.source_dir));

  it('watch() - theme', async () => await testWatch(join(hexo.theme_dir, 'source')));

  it('watch() - merge theme config', () => {
    const theme_config_1 = [
      'a:',
      '  b: 1',
      '  c: 2'
    ].join('\n');
    const theme_config_2 = [
      'a:',
      '  b: 1',
      '  c: 3'
    ].join('\n');

    const hexo = new Hexo(__dirname, { silent: true });
    hexo.config.theme_config = { a: { b: 3, d: 4 } };
    const theme_config_path = join(hexo.theme_dir, '_config.yml');

    return writeFile(theme_config_path, theme_config_1)
      .then(() => hexo.init())
      .then(() => hexo.watch())
      .then(() => {
        hexo.theme.config.a.should.have.own.property('d');
        hexo.theme.config.a.d.should.eql(4);
      })
      .then(() => writeFile(theme_config_path, theme_config_2))
      .delay(300)
      .then(() => {
        hexo.theme.config.a.should.have.own.property('d');
        hexo.theme.config.a.d.should.eql(4);
      })
      .then(() => hexo.unwatch())
      .delay(300)
      .then(() => unlink(theme_config_path))
      .delay(300);
  });

  // it('unwatch()'); missing-unit-test

  it('exit()', async () => {
    const hook = spy();
    const listener = spy();

    hexo.extend.filter.register('before_exit', hook);
    hexo.once('exit', listener);

    await hexo.exit();
    hook.calledOnce.should.be.true;
    listener.calledOnce.should.be.true;
  });

  it('exit() - error handling - callback', callback => {
    hexo.once('exit', err => {
      err.should.eql({ foo: 'bar' });
      callback();
    });

    hexo.exit({ foo: 'bar' });
  });

  it('exit() - error handling - promise', () => {
    return BluebirdPromise.all([
      hexo.exit({ foo: 'bar' }),
      new BluebirdPromise((resolve, reject) => {
        hexo.once('exit', err => {
          try {
            err.should.eql({ foo: 'bar' });
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      })
    ]);
  });

  it('draft visibility', async () => {
    const posts = await Post.insert([
      {source: 'foo', slug: 'foo', published: true},
      {source: 'bar', slug: 'bar', published: false}
    ]);
    hexo.locals.invalidate();
    hexo.locals.get('posts').toArray().should.eql(posts.slice(0, 1));

    // draft visible
    hexo.config.render_drafts = true;
    hexo.locals.invalidate();
    hexo.locals.get('posts').toArray().should.eql(posts);
    hexo.config.render_drafts = false;

    posts.map(post => Post.removeById(post._id));
  });

  it('future posts', async () => {
    const posts = await Post.insert([
      {source: 'foo', slug: 'foo', date: Date.now() - 3600},
      {source: 'bar', slug: 'bar', date: Date.now() + 3600}
    ]);

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

    posts.map(post => Post.removeById(post._id));
  });

  it('future pages', async () => {
    const pages = await Page.insert([
      {source: 'foo', path: 'foo', date: Date.now() - 3600},
      {source: 'bar', path: 'bar', date: Date.now() + 3600}
    ]);
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

    pages.map(page => Page.removeById(page._id));
  });

  it('locals.data', async () => {
    const data = await Data.insert([
      {_id: 'users', data: {foo: 1}},
      {_id: 'comments', data: {bar: 2}}
    ]);
    hexo.locals.invalidate();
    hexo.locals.get('data').should.eql({
      users: { foo: 1 },
      comments: { bar: 2 }
    });

    data.map(data => data.remove());
  });

  it('_generate()', async () => {
    // object
    hexo.extend.generator.register('test_obj', (locals: any) => {
      locals.test.should.eql('foo');

      return {
        path: 'foo',
        data: 'foo'
      };
    });

    // array
    hexo.extend.generator.register('test_arr', (locals: any) => {
      locals.test.should.eql('foo');

      return [
        { path: 'bar', data: 'bar' },
        { path: 'baz', data: 'baz' }
      ];
    });

    const beforeListener = spy();
    const afterListener = spy();
    const afterHook = spy();

    const beforeHook = spy(() => {
      hexo.locals.set('test', 'foo');
    });

    hexo.once('generateBefore', beforeListener);
    hexo.once('generateAfter', afterListener);
    hexo.extend.filter.register('before_generate', beforeHook);
    hexo.extend.filter.register('after_generate', afterHook);

    await hexo._generate();

    route.list().should.eql(['foo', 'bar', 'baz']);
    beforeListener.calledOnce.should.be.true;
    afterListener.calledOnce.should.be.true;
    beforeHook.calledOnce.should.be.true;
    afterHook.calledOnce.should.be.true;

    await BluebirdPromise.all([
      checkStream(route.get('foo'), 'foo'),
      checkStream(route.get('bar'), 'bar'),
      checkStream(route.get('baz'), 'baz')
    ]);
  });

  it('_generate() - layout', async () => {
    hexo.theme.setView('test.njk', [
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
      join(hexo.theme_dir, 'layout') + sep
    ].join('\n');

    await hexo._generate();
    await checkStream(route.get('test'), expected);
  });

  it('_generate() - layout array', async () => {
    hexo.theme.setView('baz.njk', 'baz');

    hexo.extend.generator.register('test', () => ({
      path: 'test',
      layout: ['foo', 'bar', 'baz']
    }));

    await hexo._generate();
    await checkStream(route.get('test'), 'baz');
  });

  it('_generate() - layout not exist', async () => {
    hexo.extend.generator.register('test', () => ({
      path: 'test',
      layout: 'nothing'
    }));

    await hexo._generate();
    await checkStream(route.get('test'), '');
  });

  it('_generate() - remove old routes', async () => {
    hexo.extend.generator.register('test', () => ({
      path: 'bar',
      data: 'newbar'
    }));

    route.set('foo', 'foo');
    route.set('bar', 'bar');
    route.set('baz', 'baz');

    await hexo._generate();
    should.not.exist(route.get('foo'));
    should.not.exist(route.get('baz'));
    await checkStream(route.get('bar'), 'newbar');
  });

  it('_generate() - _after_html_render filter', async () => {
    const hook = spy(result => result.replace('foo', 'bar'));
    hexo.extend.filter.register('after_render:html', hook);
    hexo.theme.setView('test.njk', 'foo');
    hexo.extend.generator.register('test', () => ({
      path: 'test',
      layout: 'test'
    }));
    await hexo._generate();
    await checkStream(route.get('test'), 'bar');
    hook.called.should.eql(true);
  });

  it('_generate() - after_render:html is alias of _after_html_render', async () => {
    const hook = spy(result => result.replace('foo', 'bar'));
    hexo.extend.filter.register('after_render:html', hook);
    hexo.theme.setView('test.njk', 'foo');
    hexo.extend.generator.register('test', () => ({
      path: 'test',
      layout: 'test'
    }));
    await hexo._generate();
    await checkStream(route.get('test'), 'bar');
    hook.called.should.eql(true);
  });

  it('_generate() - return nothing in generator', async () => {
    // @ts-expect-error
    hexo.extend.generator.register('test_nothing', () => {
      //
    });

    hexo.extend.generator.register('test_normal', () => ({
      path: 'bar',
      data: 'bar'
    }));

    await hexo._generate();
    await checkStream(route.get('bar'), 'bar');
  });

  it('_generate() - validate locals', async () => {
    hexo.theme.setView('test.njk', [
      '{{ path }}',
      '{{ url }}',
      '{{ view_dir }}'
    ].join('\n'));

    hexo.extend.generator.register('test', () => ({
      path: 'test',
      layout: 'test'
    }));

    await hexo._generate();
    await checkStream(route.get('test'), [
      'test',
      hexo.config.url + '/test',
      join(hexo.theme_dir, 'layout') + sep
    ].join('\n'));
  });

  it('_generate() - should encode url', async () => {
    const path = 'bár';
    hexo.config.url = 'http://fôo.com';

    hexo.theme.setView('test.njk', '{{ url }}');

    hexo.extend.generator.register('test', () => ({
      path,
      layout: 'test'
    }));

    await hexo._generate();
    await checkStream(route.get(path), full_url_for.call(hexo, path));
  });

  it('_generate() - do nothing if it\'s generating', () => {
    const hook = spy();
    hexo.extend.generator.register('test', hook);

    hexo._isGenerating = true;
    hexo._generate();
    hook.called.should.be.false;
    hexo._isGenerating = false;
  });

  it('_generate() - reset cache for new route', async () => {
    let count = 0;

    hexo.theme.setView('test.njk', '{{ page.count() }}');

    hexo.extend.generator.register('test', () => ({
      path: 'test',
      layout: 'test',
      data: { count: () => count++ }
    }));


    await hexo._generate({cache: true}); // First generate
    await checkStream(route.get('test'), '0');
    await checkStream(route.get('test'), '0'); // should return cached result

    await hexo._generate({cache: true}); // Second generate
    await checkStream(route.get('test'), '1');
    await checkStream(route.get('test'), '1'); // should return cached result
  });

  it('_generate() - cache disabled and use new route', async () => {
    let count = 0;

    hexo.theme.setView('test.njk', '{{ page.count() }}');

    hexo.extend.generator.register('test', () => ({
      path: 'test',
      layout: 'test',
      data: { count: () => count++ }
    }));


    await hexo._generate({ cache: false }); // First generate
    await checkStream(route.get('test'), '0');
    await checkStream(route.get('test'), '1');

    await hexo._generate({ cache: false }); // Second generate
    await checkStream(route.get('test'), '2');
    await checkStream(route.get('test'), '3');
  });

  it('_generate() - cache disabled & update template', async () => {
    hexo.theme.setView('test.njk', '0');

    hexo.extend.generator.register('test', () => ({
      path: 'test',
      layout: 'test'
    }));

    await hexo._generate({ cache: false });
    await checkStream(route.get('test'), '0');
    hexo.theme.setView('test.njk', '1');
    await checkStream(route.get('test'), '1');
  });

  it('_generate() - cache enabled & update template', async () => {
    hexo.theme.setView('test.njk', '0');

    hexo.extend.generator.register('test', () => ({
      path: 'test',
      layout: 'test'
    }));

    await hexo._generate({ cache: true });
    await checkStream(route.get('test'), '0');
    hexo.theme.setView('test.njk', '1');
    await checkStream(route.get('test'), '0'); // should return cached result
  });

  it('execFilter()', async () => {
    const fn = str => {
      return str + 'foo';
    };
    hexo.extend.filter.register('exec_test', fn);

    const result = await hexo.execFilter('exec_test', '');
    result.should.eql('foo');
    hexo.extend.filter.unregister('exec_test', fn);
  });

  it('execFilter() - promise', async () => {
    const fn = str => {
      return new BluebirdPromise((resolve, _reject) => {
        resolve(str + 'bar');
      });
    };
    hexo.extend.filter.register('exec_test', fn);

    const result = await hexo.execFilter('exec_test', 'foo');
    result.should.eql('foobar');
    hexo.extend.filter.unregister('exec_test', fn);
  });

  it('execFilterSync()', () => {
    hexo.extend.filter.register('exec_sync_test', data => {
      data.should.eql('');
      return data + 'foo';
    });

    hexo.execFilterSync('exec_sync_test', '').should.eql('foo');
  });
});
