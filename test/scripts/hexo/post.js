var should = require('chai').should();
var pathFn = require('path');
var moment = require('moment');
var Promise = require('bluebird');
var util = require('../../../lib/util');
var fs = util.fs;

describe('Post', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var post = hexo.post;

  before(function(){
    return hexo.init();
  });

  it('create()', function(){
    var emitted = false;
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment();

    var content = [
      'title: "Hello World"',
      'date: ' + date.format('YYYY-MM-DD HH:mm:ss'),
      'tags:',
      '---'
    ].join('\n') + '\n';

    hexo.once('new', function(){
      emitted = true;
    });

    return post.create({
      title: 'Hello World'
    }).then(function(post){
      post.path.should.eql(path);
      post.content.should.eql(content);
      emitted.should.be.true;

      return fs.readFile(path);
    }).then(function(data){
      data.should.eql(content);
      return fs.unlink(path);
    });
  });

  it('create() - slug', function(){
    var path = pathFn.join(hexo.source_dir, '_posts', 'foo.md');
    var date = moment();

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
    var date = moment();

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
    var date = moment();

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
    var date = moment();

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

  it.skip('load()');

  it('publish()', function(){
    var draftPath = '';
    var path = pathFn.join(hexo.source_dir, '_posts', 'Hello-World.md');
    var date = moment();

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
    var date = moment();

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

  it.skip('render()');
});