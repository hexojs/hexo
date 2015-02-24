'use strict';

var should = require('chai').should();
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');
var sinon = require('sinon');
var sep = pathFn.sep;
var testUtil = require('../../util');

describe('Hexo', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'hexo_test'), {silent: true});
  var coreDir = pathFn.join(__dirname, '../../..');
  var version = require('../../../package.json').version;
  var Post = hexo.model('Post');
  var Page = hexo.model('Page');
  var Data = hexo.model('Data');
  var route = hexo.route;

  function checkStream(stream, expected){
    return testUtil.stream.read(stream).then(function(data){
      data.should.eql(expected);
    });
  }

  function loadAssetGenerator(){
    hexo.extend.generator.register('asset', require('../../../lib/plugins/generator/asset'));
  }

  before(function(){
    return fs.mkdirs(hexo.base_dir).then(function(){
      return hexo.init();
    });
  });

  beforeEach(function(){
    // Unregister all generators
    hexo.extend.generator.store = {};
    // Remove all routes
    route.routes = {};
  });

  after(function(){
    return fs.rmdir(hexo.base_dir);
  });

  hexo.extend.console.register('test', function(args){
    return args;
  });

  it('constructor', function(){
    var hexo = new Hexo(__dirname);

    hexo.core_dir.should.eql(coreDir + sep);
    hexo.lib_dir.should.eql(pathFn.join(coreDir, 'lib') + sep);
    hexo.version.should.eql(version);
    hexo.base_dir.should.eql(__dirname + sep);
    hexo.public_dir.should.eql(pathFn.join(__dirname, 'public') + sep);
    hexo.source_dir.should.eql(pathFn.join(__dirname, 'source') + sep);
    hexo.plugin_dir.should.eql(pathFn.join(__dirname, 'node_modules') + sep);
    hexo.script_dir.should.eql(pathFn.join(__dirname, 'scripts') + sep);
    hexo.scaffold_dir.should.eql(pathFn.join(__dirname, 'scaffolds') + sep);
    hexo.env.should.eql({
      args: {},
      debug: false,
      safe: false,
      silent: false,
      env: process.env.NODE_ENV || 'development',
      version: version,
      init: false
    });
    hexo.config_path.should.eql(pathFn.join(__dirname, '_config.yml'));
  });

  it('call()', function(){
    return hexo.call('test', {foo: 'bar'}).then(function(data){
      data.should.eql({foo: 'bar'});
    });
  });

  it('call() - callback', function(callback){
    hexo.call('test', {foo: 'bar'}, function(err, data){
      should.not.exist(err);
      data.should.eql({foo: 'bar'});

      callback();
    });
  });

  it('call() - console not registered', function(){
    return hexo.call('nothing').catch(function(err){
      err.should.have.property('message', 'Console `nothing` has not been registered yet!');
    });
  });

  it('init()', function(){
    var hexo = new Hexo(pathFn.join(__dirname, 'hexo_test'), {silent: true});
    var hook = sinon.spy();

    hexo.extend.filter.register('after_init', hook);

    return hexo.init().then(function(){
      hook.calledOnce.should.be.true;
    });
  });

  it('model()');

  it('_showDrafts()', function(){
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

  function testLoad(path){
    var target = pathFn.join(path, 'test.txt');
    var body = 'test';

    loadAssetGenerator();

    return fs.writeFile(target, body).then(function(){
      return hexo.load();
    }).then(function(){
      return checkStream(route.get('test.txt'), body);
    }).then(function(){
      return fs.unlink(target);
    });
  }

  it('load() - source', function(){
    return testLoad(hexo.source_dir);
  });

  it('load() - theme', function(){
    return testLoad(pathFn.join(hexo.theme_dir, 'source'));
  });

  function testWatch(path){
    var target = pathFn.join(path, 'test.txt');
    var body = 'test';
    var newBody = body + body;

    loadAssetGenerator();

    return fs.writeFile(target, body).then(function(){
      return hexo.watch();
    }).then(function(){
      // Test for first generation
      return checkStream(route.get('test.txt'), body);
    }).then(function(){
      // Update the file
      return fs.writeFile(target, newBody);
    }).delay(300).then(function(){
      // Check the new route
      return checkStream(route.get('test.txt'), newBody);
    }).then(function(){
      // Stop watching
      return hexo.unwatch();
    }).then(function(){
      // Delete the file
      return fs.unlink(target);
    });
  }

  it('watch() - source', function(){
    return testWatch(hexo.source_dir);
  });

  it('watch() - theme', function(){
    return testWatch(pathFn.join(hexo.theme_dir, 'source'));
  });

  it('unwatch()');

  it('exit()', function(){
    var hook = sinon.spy();
    var listener = sinon.spy();

    hexo.extend.filter.register('before_exit', hook);
    hexo.once('exit', listener);

    return hexo.exit().then(function(){
      hook.calledOnce.should.be.true;
      listener.calledOnce.should.be.true;
    });
  });

  it('exit() - error handling', function(callback){
    hexo.once('exit', function(err){
      err.should.eql({foo: 'bar'});
      callback();
    });

    return hexo.exit({foo: 'bar'});
  });

  it('draft visibility', function(){
    return Post.insert([
      {source: 'foo', slug: 'foo', published: true},
      {source: 'bar', slug: 'bar', published: false}
    ]).then(function(posts){
      hexo.locals.invalidate();
      hexo.locals.get('posts').toArray().should.eql(posts.slice(0, 1));

      // draft visible
      hexo.config.render_drafts = true;
      hexo.locals.invalidate();
      hexo.locals.get('posts').toArray().should.eql(posts);
      hexo.config.render_drafts = false;

      return posts;
    }).map(function(post){
      return Post.removeById(post._id);
    });
  });

  it('future posts', function(){
    return Post.insert([
      {source: 'foo', slug: 'foo', date: Date.now() - 3600},
      {source: 'bar', slug: 'bar', date: Date.now() + 3600}
    ]).then(function(posts){
      function mapper(post){
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
    }).map(function(post){
      return Post.removeById(post._id);
    });
  });

  it('future pages', function(){
    return Page.insert([
      {source: 'foo', path: 'foo', date: Date.now() - 3600},
      {source: 'bar', path: 'bar', date: Date.now() + 3600}
    ]).then(function(pages){
      function mapper(page){
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
    }).map(function(page){
      return Page.removeById(page._id);
    });
  });

  it('locals.data', function(){
    return Data.insert([
      {_id: 'users', data: {foo: 1}},
      {_id: 'comments', data: {bar: 2}}
    ]).then(function(data){
      hexo.locals.invalidate();
      hexo.locals.get('data').should.eql({
        users: {foo: 1},
        comments: {bar: 2}
      });

      return data;
    }).map(function(data){
      return data.remove();
    });
  });

  it('_generate()', function(){
    // object
    hexo.extend.generator.register('test_obj', function(locals){
      locals.test.should.eql('foo');

      return {
        path: 'foo',
        data: 'foo'
      };
    });

    // array
    hexo.extend.generator.register('test_arr', function(locals){
      locals.test.should.eql('foo');

      return [
        {path: 'bar', data: 'bar'},
        {path: 'baz', data: 'baz'}
      ];
    });

    var beforeListener = sinon.spy();
    var afterListener = sinon.spy();
    var afterHook = sinon.spy();

    var beforeHook = sinon.spy(function(){
      hexo.locals.set('test', 'foo');
    });

    hexo.once('generateBefore', beforeListener);
    hexo.once('generateAfter', afterListener);
    hexo.extend.filter.register('before_generate', beforeHook);
    hexo.extend.filter.register('after_generate', afterHook);

    return hexo._generate().then(function(){
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

  it('_generate() - layout', function(){
    hexo.theme.setView('test.swig', [
      '{{ config.title }}',
      '{{ page.foo }}',
      '{{ layout }}',
      '{{ view_dir }}'
    ].join('\n'));

    hexo.extend.generator.register('test', function(){
      return {
        path: 'test',
        layout: 'test',
        data: {
          foo: 'bar'
        }
      };
    });

    var expected = [
      hexo.config.title,
      'bar',
      'layout',
      pathFn.join(hexo.theme_dir, 'layout') + pathFn.sep
    ].join('\n');

    return hexo._generate().then(function(){
      return checkStream(route.get('test'), expected);
    });
  });

  it('_generate() - layout array', function(){
    hexo.theme.setView('baz.swig', 'baz');

    hexo.extend.generator.register('test', function(){
      return {
        path: 'test',
        layout: ['foo', 'bar', 'baz']
      };
    });

    return hexo._generate().then(function(){
      return checkStream(route.get('test'), 'baz');
    });
  });

  it('_generate() - layout not exist', function(){
    hexo.extend.generator.register('test', function(){
      return {
        path: 'test',
        layout: 'nothing'
      };
    });

    return hexo._generate().then(function(){
      return checkStream(route.get('test'), '');
    });
  });

  it('_generate() - remove old routes', function(){
    hexo.extend.generator.register('test', function(){
      return {
        path: 'bar',
        data: 'newbar'
      };
    });

    route.set('foo', 'foo');
    route.set('bar', 'bar');
    route.set('baz', 'baz');

    return hexo._generate().then(function(){
      should.not.exist(route.get('foo'));
      should.not.exist(route.get('baz'));

      return checkStream(route.get('bar'), 'newbar');
    });
  });

  it('_generate() - return nothing in generator', function(){
    hexo.extend.generator.register('test_nothing', function(){
      //
    });

    hexo.extend.generator.register('test_normal', function(){
      return {
        path: 'bar',
        data: 'bar'
      };
    });

    return hexo._generate().then(function(){
      return checkStream(route.get('bar'), 'bar');
    });
  });

  it('_generate() - validate locals', function(){
    hexo.theme.setView('test.swig', [
      '{{ path }}',
      '{{ url }}',
      '{{ view_dir }}'
    ].join('\n'));

    hexo.extend.generator.register('test', function(){
      return {
        path: 'test',
        layout: 'test'
      };
    });

    return hexo._generate().then(function(){
      return checkStream(route.get('test'), [
        'test',
        hexo.config.url + '/test',
        pathFn.join(hexo.theme_dir, 'layout') + pathFn.sep
      ].join('\n'));
    });
  });

  it('_generate() - do nothing if it\'s generating', function(){
    var spy = sinon.spy();
    hexo.extend.generator.register('test', spy);

    hexo._isGenerating = true;
    hexo._generate();
    spy.called.should.be.false;
    hexo._isGenerating = false;
  });

  it('_generate() - reset cache for new route', function(){
    var count = 0;

    hexo.theme.setView('test.swig', '{{ page.count }}');

    hexo.extend.generator.register('test', function(){
      return {
        path: 'test',
        layout: 'test',
        data: {count: count++}
      };
    });

    // First generation
    return hexo._generate({cache: true}).then(function(){
      return checkStream(route.get('test'), '0');
    }).then(function(){
      // Second generation
      return hexo._generate({cache: true});
    }).then(function(){
      return checkStream(route.get('test'), '1');
    });
  });

  it('_generate() - cache disabled & update template', function(){
    hexo.theme.setView('test.swig', '0');

    hexo.extend.generator.register('test', function(){
      return {
        path: 'test',
        layout: 'test'
      };
    });

    return hexo._generate({cache: false}).then(function(){
      return checkStream(route.get('test'), '0');
    }).then(function(){
      hexo.theme.setView('test.swig', '1');
      return checkStream(route.get('test'), '1');
    });
  });

  it('execFilter()', function(){
    hexo.extend.filter.register('exec_test', function(data){
      data.should.eql('');
      return data + 'foo';
    });

    return hexo.execFilter('exec_test', '').then(function(result){
      result.should.eql('foo');
    });
  });

  it('execFilterSync()', function(){
    hexo.extend.filter.register('exec_sync_test', function(data){
      data.should.eql('');
      return data + 'foo';
    });

    hexo.execFilterSync('exec_sync_test', '').should.eql('foo');
  });
});