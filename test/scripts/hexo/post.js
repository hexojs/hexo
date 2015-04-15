'use strict';

var should = require('chai').should();
var pathFn = require('path');
var moment = require('moment');
var Promise = require('bluebird');
var fs = require('hexo-fs');
var util = require('hexo-util');
var sinon = require('sinon');
var fixture = require('../../fixtures/post_render');

describe('Post', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(pathFn.join(__dirname, 'post_test'));
  var post = hexo.post;
  var now = Date.now();
  var clock;

  before(function(){
    clock = sinon.useFakeTimers(now);

    return fs.mkdirs(hexo.base_dir, function(){
      return hexo.init();
    }).then(function(){
      // Load marked renderer for testing
      return hexo.loadPlugin(require.resolve('hexo-renderer-marked'));
    }).then(function(){
      return hexo.scaffold.set('post', [
        'title: {{ title }}',
        'date: {{ date }}',
        'tags:',
        '---'
      ].join('\n'));
    }).then(function(){
      return hexo.scaffold.set('draft', [
        'title: {{ title }}',
        'tags:',
        '---'
      ].join('\n'));
    });
  });

  after(function(){
    clock.restore();
    return fs.rmdir(hexo.base_dir);
  });

  it('create()', function(){
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment(now);
    var listener = sinon.spy();

    var content = [
      'title: "Hello World"',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    hexo.once('new', listener);

    return post.create({
      title: 'Hello World'
    }).then(function(post){
      post.path.should.eql(path);
      post.content.should.eql(content);
      listener.calledOnce.should.be.true;

      return fs.readFile(path);
    }).then(function(data){
      data.should.eql(content);
      return fs.unlink(path);
    });
  });

  it('create() - slug', function(){
    var path = pathFn.join(hexo.source_dir, '_posts', 'foo.md');
    var date = moment(now);

    var content = [
      'title: "Hello World"',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return post.create({
      title: 'Hello World',
      slug: 'foo'
    }).then(function(post){
      post.path.should.eql(path);
      post.content.should.eql(content);

      return fs.readFile(path);
    }).then(function(data){
      data.should.eql(content);
      return fs.unlink(path);
    });
  });

  it('create() - filename_case', function(){
    hexo.config.filename_case = 1;

    var path = pathFn.join(hexo.source_dir, '_posts', 'hello-world.md');
    var date = moment(now);

    var content = [
      'title: "Hello World"',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return post.create({
      title: 'Hello World'
    }).then(function(post){
      post.path.should.eql(path);
      post.content.should.eql(content);
      hexo.config.filename_case = 0;

      return fs.readFile(path);
    }).then(function(data){
      data.should.eql(content);
      return fs.unlink(path);
    });
  });

  it('create() - layout', function(){
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment(now);

    var content = [
      'layout: photo',
      'title: "Hello World"',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return post.create({
      title: 'Hello World',
      layout: 'photo'
    }).then(function(post){
      post.path.should.eql(path);
      post.content.should.eql(content);

      return fs.readFile(path);
    }).then(function(data){
      data.should.eql(content);
      return fs.unlink(path);
    });
  });

  it('create() - extra data', function(){
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment(now);

    var content = [
      'title: "Hello World"',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      'foo: bar',
      '---'
    ].join('\n') + '\n';

    return post.create({
      title: 'Hello World',
      foo: 'bar'
    }).then(function(post){
      post.path.should.eql(path);
      post.content.should.eql(content);

      return fs.readFile(path);
    }).then(function(data){
      data.should.eql(content);
      return fs.unlink(path);
    });
  });

  it('create() - rename if target existed', function(){
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World-1.md');

    return post.create({
      title: 'Hello World'
    }).then(function(){
      return post.create({
        title: 'Hello World'
      });
    }).then(function(post){
      post.path.should.eql(path);
      return fs.exists(path);
    }).then(function(exist){
      exist.should.be.true;

      return Promise.all([
        fs.unlink(path),
        fs.unlink(pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md'))
      ]);
    });
  });

  it('create() - replace existing files', function(){
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');

    return post.create({
      title: 'Hello World'
    }).then(function(){
      return post.create({
        title: 'Hello World'
      }, true);
    }).then(function(post){
      post.path.should.eql(path);
      return fs.unlink(path);
    });
  });

  it('create() - asset folder', function(){
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World');

    hexo.config.post_asset_folder = true;

    return post.create({
      title: 'Hello World'
    }).then(function(post){
      hexo.config.post_asset_folder = false;
      return fs.stat(path);
    }).then(function(stats){
      stats.isDirectory().should.be.true;
      return fs.unlink(path + '.md');
    });
  });

  it('create() - follow the separator style in the scaffold', function(){
    var scaffold = [
      '---',
      'title: {{ title }}',
      '---'
    ].join('\n');

    return hexo.scaffold.set('test', scaffold).then(function(){
      return post.create({
        title: 'Hello World',
        layout: 'test'
      });
    }).then(function(post){
      post.content.should.eql([
        '---',
        'title: "Hello World"',
        '---'
      ].join('\n') + '\n');

      return Promise.all([
        fs.unlink(post.path),
        hexo.scaffold.remove('test')
      ]);
    });
  });

  it('create() - JSON front-matter', function(){
    var scaffold = [
      '"title": {{ title }}',
      ';;;'
    ].join('\n');

    return hexo.scaffold.set('test', scaffold).then(function(){
      return post.create({
        title: 'Hello World',
        layout: 'test',
        lang: 'en'
      });
    }).then(function(post){
      post.content.should.eql([
        '"title": "Hello World",',
        '"lang": "en"',
        ';;;'
      ].join('\n') + '\n');

      return Promise.all([
        fs.unlink(post.path),
        hexo.scaffold.remove('test')
      ]);
    });
  });

  // https://github.com/hexojs/hexo/issues/1100
  it('create() - non-string title', function(){
    var path = pathFn.join(hexo.source_dir, '_posts', '12345.md');

    return post.create({
      title: 12345
    }).then(function(data){
      data.path.should.eql(path);
      return fs.unlink(path);
    });
  });

  it('create() - with content', function(){
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment(now);

    var content = [
      'title: "Hello World"',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---',
      '',
      'Hello hexo'
    ].join('\n');

    return post.create({
      title: 'Hello World',
      content: 'Hello hexo'
    }).then(function(post){
      post.path.should.eql(path);
      post.content.should.eql(content);

      return fs.readFile(path);
    }).then(function(data){
      data.should.eql(content);
      return fs.unlink(path);
    });
  });

  it('create() - with callback', function(){
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment(now);
    var callback = sinon.spy(function(post) {
      post.path.should.eql(path);
      post.content.should.eql(content);
    });

    var content = [
      'title: "Hello World"',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return post.create({
      title: 'Hello World'
    }, callback).then(function(post){
      callback.calledOnce.should.be.true;
      return fs.readFile(path);
    }).then(function(data){
      data.should.eql(content);
      return fs.unlink(path);
    });
  });

  it('publish()', function(){
    var draftPath = '';
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment(now);

    var content = [
      'title: "Hello World"',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return post.create({
      title: 'Hello World',
      layout: 'draft'
    }).then(function(data){
      draftPath = data.path;

      return post.publish({
        slug: 'Hello-World'
      });
    }).then(function(post){
      post.path.should.eql(path);
      post.content.should.eql(content);

      return Promise.all([
        fs.exists(draftPath),
        fs.readFile(path)
      ]);
    }).spread(function(exist, data){
      exist.should.be.false;
      data.should.eql(content);

      return fs.unlink(path);
    });
  });

  it('publish() - layout', function(){
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment(now);

    var content = [
      'layout: photo',
      'title: "Hello World"',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return post.create({
      title: 'Hello World',
      layout: 'draft'
    }).then(function(data){
      return post.publish({
        slug: 'Hello-World',
        layout: 'photo'
      });
    }).then(function(post){
      post.path.should.eql(path);
      post.content.should.eql(content);

      return fs.readFile(path);
    }).then(function(data){
      data.should.eql(content);

      return fs.unlink(path);
    });
  });

  it('publish() - rename if target existed', function(){
    var paths = [pathFn.join(hexo.source_dir, '_posts', 'Hello-World-1.md')];

    return Promise.all([
      post.create({title: 'Hello World', layout: 'draft'}),
      post.create({title: 'Hello World'})
    ]).then(function(data){
      paths.push(data[1].path);

      return post.publish({
        slug: 'Hello-World'
      });
    }).then(function(data){
      data.path.should.eql(paths[0]);
      return paths;
    }).map(function(item){
      return fs.unlink(item);
    });
  });

  it('publish() - replace existing files', function(){
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');

    return Promise.all([
      post.create({title: 'Hello World', layout: 'draft'}),
      post.create({title: 'Hello World'})
    ]).then(function(data){
      return post.publish({
        slug: 'Hello-World'
      }, true);
    }).then(function(data){
      data.path.should.eql(path);
      return fs.unlink(path);
    });
  });

  it('publish() - asset folder', function(){
    var assetDir = pathFn.join(hexo.source_dir, '_drafts', 'Hello-World');
    var newAssetDir = pathFn.join(hexo.source_dir, '_posts', 'Hello-World');
    hexo.config.post_asset_folder = true;

    return post.create({
      title: 'Hello World',
      layout: 'draft'
    }).then(function(data){
      // Put some files into the asset folder
      return Promise.all([
        fs.writeFile(pathFn.join(assetDir, 'a.txt'), 'a'),
        fs.writeFile(pathFn.join(assetDir, 'b.txt'), 'b')
      ]);
    }).then(function(){
      return post.publish({
        slug: 'Hello-World'
      });
    }).then(function(post){
      return Promise.all([
        fs.exists(assetDir),
        fs.listDir(newAssetDir),
        fs.unlink(post.path)
      ]);
    }).spread(function(exist, files){
      hexo.config.post_asset_folder = false;
      exist.should.be.false;
      files.should.have.members(['a.txt', 'b.txt']);
      return fs.rmdir(newAssetDir);
    });
  });

  //https://github.com/hexojs/hexo/issues/1100
  it('publish() - non-string title', function(){
    var path = pathFn.join(hexo.source_dir, '_posts', '12345.md');

    return post.create({
      title: 12345,
      layout: 'draft'
    }).then(function(data){
      return post.publish({
        slug: 12345
      });
    }).then(function(data){
      data.path.should.eql(path);
      return fs.unlink(path);
    });
  });

  it('publish() - with callback', function(){
    var draftPath = '';
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment(now);
    var callback = sinon.spy(function(post) {
      post.path.should.eql(path);
      post.content.should.eql(content);
    });

    var content = [
      'title: "Hello World"',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    return post.create({
      title: 'Hello World',
      layout: 'draft'
    }, callback).then(function(data){
      draftPath = data.path;

      return post.publish({
        slug: 'Hello-World'
      });
    }).then(function(post){
      callback.calledOnce.should.be.true;

      return Promise.all([
        fs.exists(draftPath),
        fs.readFile(path)
      ]);
    }).spread(function(exist, data){
      exist.should.be.false;
      data.should.eql(content);

      return fs.unlink(path);
    });
  });

  it('render()', function(){
    // TODO: validate data
    var beforeHook = sinon.spy();
    var afterHook = sinon.spy();

    hexo.extend.filter.register('before_post_render', beforeHook);
    hexo.extend.filter.register('after_post_render', afterHook);

    return post.render(null, {
      content: fixture.content,
      engine: 'markdown'
    }).then(function(data){
      data.content.trim().should.eql(fixture.expected);
      beforeHook.calledOnce.should.be.true;
      afterHook.calledOnce.should.be.true;
    });
  });

  it('render() - file', function(){
    var content = '**file test**';
    var path = pathFn.join(hexo.base_dir, 'render_test.md');

    return fs.writeFile(path, content).then(function(){
      return post.render(path);
    }).then(function(data){
      data.content.trim().should.eql('<p><strong>file test</strong></p>');
      return fs.unlink(path);
    });
  });

  it('render() - toString', function(){
    var content = 'foo: 1';

    return post.render(null, {
      content: content,
      engine: 'yaml'
    }).then(function(data){
      data.content.should.eql('{"foo":1}');
    });
  });

  it('render() - skip render phase if it\'s swig file', function(){
    var content = [
      '{% quote Hello World %}',
      'quote content',
      '{% endquote %}'
    ].join('\n');

    return post.render(null, {
      content: content,
      engine: 'swig'
    }).then(function(data){
      data.content.trim().should.eql([
        '<blockquote><p>quote content</p>\n',
        '<footer><strong>Hello World</strong></footer></blockquote>'
      ].join(''));
    });
  });

  it('render() - escaping swig blocks with similar names', function(){
    var code = 'alert("Hello world")';
    var highlighted = util.highlight(code);

    var content = [
      '{% codeblock %}',
      code,
      '{% endcodeblock %}',
      '',
      '{% code %}',
      code,
      '{% endcode %}'
    ].join('\n');

    return post.render(null, {
      content: content
    }).then(function(data){
      data.content.trim().should.eql([
        highlighted,
        '',
        highlighted
      ].join('\n'));
    });
  });

  it('render() - recover escaped swig blocks which is html escaped', function(){
    var content = '`{% raw %}{{ test }}{% endraw %}`';

    return post.render(null, {
      content: content,
      engine: 'markdown'
    }).then(function(data){
      data.content.trim().should.eql('<p><code>{{ test }}</code></p>');
    });
  });

  it('render() - recover escaped swig blocks which is html escaped before post_render', function(){
    var content = '`{% raw %}{{ test }}{% endraw %}`';

    var filter = sinon.spy(function(result) {
      result.trim().should.eql('<p><code>{{ test }}</code></p>');
    });
    hexo.extend.filter.register('after_render:html', filter);

    return post.render(null, {
      content: content,
      engine: 'markdown'
    }).then(function(data){
      filter.calledOnce.should.be.true;
      hexo.extend.filter.unregister('after_render:html', filter);
    });
  });
});