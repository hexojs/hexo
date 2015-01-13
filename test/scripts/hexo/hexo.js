var should = require('chai').should();
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');
var sep = pathFn.sep;
var testUtil = require('../../util');

describe('Hexo', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'hexo_test'), {silent: true});
  var coreDir = pathFn.join(__dirname, '../../..');
  var version = require('../../../package.json').version;
  var Post = hexo.model('Post');
  var Page = hexo.model('Page');
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
      env: 'development',
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

  it('init()');

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
    }).then(function(){
      // Wait for a while
      return testUtil.wait(300);
    }).then(function(){
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
    var executed = 0;

    hexo.extend.filter.register('before_exit', function(){
      executed++;
    });

    hexo.once('exit', function(){
      executed++;
    });

    return hexo.exit().then(function(){
      executed.should.eql(2);
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
      hexo.locals.posts.toArray().should.eql(posts.slice(0, 1));

      // draft visible
      hexo.config.render_drafts = true;
      hexo.locals.posts.toArray().should.eql(posts);
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
      hexo.locals.posts.map(mapper).should.eql(posts.map(mapper));

      // future off
      hexo.config.future = false;
      hexo.locals.posts.map(mapper).should.eql([posts[0]._id]);

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
      hexo.locals.pages.map(mapper).should.eql(pages.map(mapper));

      // future off
      hexo.config.future = false;
      hexo.locals.pages.map(mapper).should.eql([pages[0]._id]);

      return pages;
    }).map(function(page){
      return Page.removeById(page._id);
    });
  });

  it('_generate()', function(){
    var executed = 0;

    // object
    hexo.extend.generator.register('test_obj', function(locals){
      return {
        path: 'foo',
        data: 'foo'
      };
    });

    // array
    hexo.extend.generator.register('test_arr', function(locals){
      return [
        {path: 'bar', data: 'bar'},
        {path: 'baz', data: 'baz'}
      ];
    });

    hexo.once('generateBefore', function(){
      executed++;
    });

    hexo.once('generateAfter', function(){
      executed++;
    });

    return hexo._generate().then(function(){
      route.list().should.eql(['foo', 'bar', 'baz']);

      executed.should.eql(2);

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

  it('_generate() - validate locals');

  it('_generate() - do nothing if it\'s generating');
});