'use strict';

var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');
var defaultConfig = require('../../../lib/hexo/default_config');

var dateFormat = 'YYYY-MM-DD HH:mm:ss';
var newPostName = defaultConfig.new_post_name;

describe('post', function() {
  var Hexo = require('../../../lib/hexo');
  var baseDir = pathFn.join(__dirname, 'post_test');
  var hexo = new Hexo(baseDir);
  var post = require('../../../lib/plugins/processor/post')(hexo);
  var process = Promise.method(post.process.bind(hexo));
  var pattern = post.pattern;
  var source = hexo.source;
  var File = source.File;
  var PostAsset = hexo.model('PostAsset');
  var Post = hexo.model('Post');

  function newFile(options) {
    var path = options.path;

    options.path = (options.published ? '_posts' : '_drafts') + '/' + path;
    options.source = pathFn.join(source.base, options.path);

    options.params = {
      published: options.published,
      path: path,
      renderable: options.renderable
    };

    return new File(options);
  }

  before(function() {
    return fs.mkdirs(baseDir).then(function() {
      return hexo.init();
    });
  });

  after(function() {
    return fs.rmdir(baseDir);
  });

  it('pattern', function() {
    // Renderable files
    pattern.match('_posts/foo.html').should.eql({
      published: true,
      path: 'foo.html',
      renderable: true
    });

    pattern.match('_drafts/bar.html').should.eql({
      published: false,
      path: 'bar.html',
      renderable: true
    });

    // Non-renderable files
    pattern.match('_posts/foo.txt').should.eql({
      published: true,
      path: 'foo.txt',
      renderable: false
    });

    pattern.match('_drafts/bar.txt').should.eql({
      published: false,
      path: 'bar.txt',
      renderable: false
    });

    // Tmp files
    should.not.exist(pattern.match('_posts/foo.html~'));
    should.not.exist(pattern.match('_posts/foo.html%'));

    // Hidden files
    should.not.exist(pattern.match('_posts/_foo.html'));
    should.not.exist(pattern.match('_posts/foo/_bar.html'));
    should.not.exist(pattern.match('_posts/.foo.html'));
    should.not.exist(pattern.match('_posts/foo/.bar.html'));

    // Outside "_posts" and "_drafts" folder
    should.not.exist(pattern.match('_foo/bar.html'));
    should.not.exist(pattern.match('baz.html'));

    // Skip render files
    hexo.config.skip_render = ['_posts/foo/**'];
    pattern.match('_posts/foo/bar.html').should.have.property('renderable', false);
    hexo.config.skip_render = [];
  });

  it('asset - post_asset_folder disabled', function() {
    hexo.config.post_asset_folder = false;

    var file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'create',
      renderable: false
    });

    return process(file).then(function() {
      var id = 'source/' + file.path;
      should.not.exist(PostAsset.findById(id));
    });
  });

  it('asset - type: create', function() {
    hexo.config.post_asset_folder = true;

    var file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'create',
      renderable: false
    });

    var postId;

    return Promise.all([
      Post.insert({
        source: '_posts/foo.html',
        slug: 'foo'
      }),
      fs.writeFile(file.source, 'test')
    ]).spread(function(doc) {
      postId = doc._id;
      return process(file);
    }).then(function() {
      var id = 'source/' + file.path;
      var asset = PostAsset.findById(id);

      asset._id.should.eql(id);
      asset.post.should.eql(postId);
      asset.modified.should.be.true;
      asset.renderable.should.be.false;
    }).finally(function() {
      hexo.config.post_asset_folder = false;

      return Promise.all([
        Post.removeById(postId),
        fs.unlink(file.source)
      ]);
    });
  });

  it('asset - type: update', function() {
    hexo.config.post_asset_folder = true;

    var file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'update',
      renderable: false
    });

    var id = 'source/' + file.path;
    var postId;

    return Promise.all([
      Post.insert({
        source: '_posts/foo.html',
        slug: 'foo'
      }),
      fs.writeFile(file.source, 'test')
    ]).spread(function(post) {
      postId = post._id;

      return PostAsset.insert({
        _id: id,
        slug: file.path,
        modified: false,
        post: postId
      });
    }).then(function() {
      return process(file);
    }).then(function() {
      var asset = PostAsset.findById(id);
      asset.modified.should.be.true;
    }).finally(function() {
      hexo.config.post_asset_folder = false;

      return Promise.all([
        Post.removeById(postId),
        fs.unlink(file.source)
      ]);
    });
  });

  it('asset - type: skip', function() {
    hexo.config.post_asset_folder = true;

    var file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'skip',
      renderable: false
    });

    var id = 'source/' + file.path;
    var postId;

    return Promise.all([
      Post.insert({
        source: '_posts/foo.html',
        slug: 'foo'
      }),
      fs.writeFile(file.source, 'test')
    ]).spread(function(post) {
      postId = post._id;

      return PostAsset.insert({
        _id: id,
        slug: file.path,
        modified: false,
        post: postId
      });
    }).then(function() {
      return process(file);
    }).then(function() {
      var asset = PostAsset.findById(id);
      asset.modified.should.be.false;
    }).finally(function() {
      hexo.config.post_asset_folder = false;

      return Promise.all([
        Post.removeById(postId),
        fs.unlink(file.source)
      ]);
    });
  });

  it('asset - type: delete', function() {
    hexo.config.post_asset_folder = true;

    var file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'delete',
      renderable: false
    });

    var id = 'source/' + file.path;
    var postId;

    return Post.insert({
      source: '_posts/foo.html',
      slug: 'foo'
    }).then(function(post) {
      postId = post._id;

      return PostAsset.insert({
        _id: id,
        slug: file.path,
        modified: false,
        post: postId
      });
    }).then(function() {
      return process(file);
    }).then(function() {
      should.not.exist(PostAsset.findById(id));
    }).finally(function() {
      hexo.config.post_asset_folder = false;
      return Post.removeById(postId);
    });
  });

  it('asset - skip if can\'t find a matching post', function() {
    hexo.config.post_asset_folder = true;

    var file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'create',
      renderable: false
    });

    var id = 'source/' + file.path;

    return fs.writeFile(file.source, 'test').then(function() {
      return process(file);
    }).then(function() {
      should.not.exist(PostAsset.findById(id));
    }).finally(function() {
      hexo.config.post_asset_folder = false;

      return fs.unlink(file.source);
    });
  });

  it('asset - the related post has been deleted', function() {
    hexo.config.post_asset_folder = true;

    var file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'update',
      renderable: false
    });

    var id = 'source/' + file.path;

    return Promise.all([
      fs.writeFile(file.source, 'test'),
      PostAsset.insert({
        _id: id,
        slug: file.path
      })
    ]).then(function() {
      return process(file);
    }).then(function() {
      should.not.exist(PostAsset.findById(id));
    }).finally(function() {
      hexo.config.post_asset_folder = false;

      return fs.unlink(file.source);
    });
  });

  it('post - type: create', function() {
    var body = [
      'title: "Hello world"',
      'date: 2006-01-02 15:04:05',
      'updated: 2014-12-13 01:02:03',
      '---',
      'The quick brown fox jumps over the lazy dog'
    ].join('\n');

    var file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(function() {
      return process(file);
    }).then(function() {
      var post = Post.findOne({source: file.path});

      post.title.should.eql('Hello world');
      post.date.format(dateFormat).should.eql('2006-01-02 15:04:05');
      post.updated.format(dateFormat).should.eql('2014-12-13 01:02:03');
      post._content.should.eql('The quick brown fox jumps over the lazy dog');
      post.source.should.eql(file.path);
      post.raw.should.eql(body);
      post.slug.should.eql('foo');
      post.published.should.be.true;

      return post.remove();
    }).finally(function() {
      return fs.unlink(file.source);
    });
  });

  it('post - type: update', function() {
    var body = [
      'title: "New world"',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'foo.html',
      published: true,
      type: 'update',
      renderable: true
    });

    var id;

    return Promise.all([
      Post.insert({source: file.path, slug: 'foo'}),
      fs.writeFile(file.source, body)
    ]).spread(function(doc) {
      id = doc._id;
      return process(file);
    }).then(function() {
      var post = Post.findOne({source: file.path});

      post._id.should.eql(id);
      post.title.should.eql('New world');

      return post.remove();
    }).finally(function() {
      return fs.unlink(file.source);
    });
  });

  it('post - type: delete', function() {
    var file = newFile({
      path: 'foo.html',
      published: true,
      type: 'delete',
      renderable: true
    });

    return Post.insert({
      source: file.path,
      slug: 'foo'
    }).then(function() {
      return process(file);
    }).then(function() {
      should.not.exist(Post.findOne({source: file.path}));
    });
  });

  it('post - parse file name', function() {
    var body = [
      'title: "Hello world"',
      '---'
    ].join('\n');

    var file = newFile({
      path: '2006/01/02/foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    hexo.config.new_post_name = ':year/:month/:day/:title';

    return fs.writeFile(file.source, body).then(function() {
      return process(file);
    }).then(function() {
      var post = Post.findOne({source: file.path});

      post.slug.should.eql('foo');
      post.date.format('YYYY-MM-DD').should.eql('2006-01-02');

      return post.remove();
    }).finally(function() {
      hexo.config.new_post_name = newPostName;
      return fs.unlink(file.source);
    });
  });

  it('post - extra data in file name', function() {
    var body = [
      'title: "Hello world"',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'zh/foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    hexo.config.new_post_name = ':lang/:title';

    return fs.writeFile(file.source, body).then(function() {
      return process(file);
    }).then(function() {
      var post = Post.findOne({source: file.path});

      post.lang.should.eql('zh');

      return post.remove();
    }).finally(function() {
      hexo.config.new_post_name = newPostName;
      return fs.unlink(file.source);
    });
  });

  it('post - file name does not match to the config', function() {
    var body = [
      'title: "Hello world"',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    hexo.config.new_post_name = ':year/:month/:day/:title';

    return fs.writeFile(file.source, body).then(function() {
      return process(file);
    }).then(function() {
      var post = Post.findOne({source: file.path});

      post.slug.should.eql('foo');

      return post.remove();
    }).finally(function() {
      hexo.config.new_post_name = newPostName;
      return fs.unlink(file.source);
    });
  });

  it('post - published', function() {
    var body = [
      'title: "Hello world"',
      'published: false',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'zh/foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(function() {
      return process(file);
    }).then(function() {
      var post = Post.findOne({source: file.path});

      post.published.should.be.false;

      return post.remove();
    }).finally(function() {
      return fs.unlink(file.source);
    });
  });

  it('post - always set published: false for drafts', function() {
    var body = [
      'title: "Hello world"',
      'published: true',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'foo.html',
      published: false,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(function() {
      return process(file);
    }).then(function() {
      var post = Post.findOne({source: file.path});

      post.published.should.be.false;

      return post.remove();
    }).finally(function() {
      return fs.unlink(file.source);
    });
  });

  it('post - use the status of the source file if date not set', function() {
    var body = [
      'title: "Hello world"',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(function() {
      return Promise.all([
        file.stat(),
        process(file)
      ]);
    }).spread(function(stats) {
      var post = Post.findOne({source: file.path});

      post.date.toDate().setMilliseconds(0).should.eql(stats.birthtime.setMilliseconds(0));
      post.updated.toDate().setMilliseconds(0).should.eql(stats.mtime.setMilliseconds(0));

      return post.remove();
    }).finally(function() {
      return fs.unlink(file.source);
    });
  });

  it('post - photo is an alias for photos', function() {
    var body = [
      'title: "Hello world"',
      'photo:',
      '- http://hexo.io/foo.jpg',
      '- http://hexo.io/bar.png',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(function() {
      return process(file);
    }).then(function() {
      var post = Post.findOne({source: file.path});

      post.photos.should.eql([
        'http://hexo.io/foo.jpg',
        'http://hexo.io/bar.png'
      ]);

      should.not.exist(post.photo);

      return post.remove();
    }).finally(function() {
      return fs.unlink(file.source);
    });
  });

  it('post - photos (not array)', function() {
    var body = [
      'title: "Hello world"',
      'photos: http://hexo.io/foo.jpg',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(function() {
      return process(file);
    }).then(function() {
      var post = Post.findOne({source: file.path});

      post.photos.should.eql([
        'http://hexo.io/foo.jpg'
      ]);

      return post.remove();
    }).finally(function() {
      return fs.unlink(file.source);
    });
  });

  it('post - link without title', function() {
    var body = [
      'link: http://hexo.io/',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(function() {
      return process(file);
    }).then(function() {
      var post = Post.findOne({source: file.path});

      post.link.should.eql('http://hexo.io/');
      post.title.should.eql('hexo.io');

      return post.remove();
    }).finally(function() {
      return fs.unlink(file.source);
    });
  });

  it('post - category is an alias for categories', function() {
    var body = [
      'title: "Hello world"',
      'category:',
      '- foo',
      '- bar',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(function() {
      return process(file);
    }).then(function() {
      var post = Post.findOne({source: file.path});

      should.not.exist(post.category);
      post.categories.map(function(item) {
        return item.name;
      }).should.eql(['foo', 'bar']);

      return post.remove();
    }).finally(function() {
      return fs.unlink(file.source);
    });
  });

  it('post - categories (not array)', function() {
    var body = [
      'title: "Hello world"',
      'categories: foo',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(function() {
      return process(file);
    }).then(function() {
      var post = Post.findOne({source: file.path});

      post.categories.map(function(item) {
        return item.name;
      }).should.eql(['foo']);

      return post.remove();
    }).finally(function() {
      return fs.unlink(file.source);
    });
  });

  it('post - tag is an alias for tags', function() {
    var body = [
      'title: "Hello world"',
      'tags:',
      '- foo',
      '- bar',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(function() {
      return process(file);
    }).then(function() {
      var post = Post.findOne({source: file.path});

      should.not.exist(post.tag);
      post.tags.map(function(item) {
        return item.name;
      }).should.have.members(['foo', 'bar']);

      return post.remove();
    }).finally(function() {
      return fs.unlink(file.source);
    });
  });

  it('post - tags (not array)', function() {
    var body = [
      'title: "Hello world"',
      'tags: foo',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(function() {
      return process(file);
    }).then(function() {
      var post = Post.findOne({source: file.path});

      post.tags.map(function(item) {
        return item.name;
      }).should.eql(['foo']);

      return post.remove();
    }).finally(function() {
      return fs.unlink(file.source);
    });
  });

  it('post - post_asset_folder enabled', function() {
    hexo.config.post_asset_folder = true;

    var body = [
      'title: "Hello world"',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    var assetId = 'source/_posts/foo/bar.jpg';
    var assetPath = pathFn.join(hexo.base_dir, assetId);

    return Promise.all([
      fs.writeFile(file.source, body),
      fs.writeFile(assetPath, '')
    ]).then(function() {
      return process(file);
    }).then(function() {
      var post = Post.findOne({source: file.path});
      var asset = PostAsset.findById(assetId);

      asset._id.should.eql(assetId);
      asset.post.should.eql(post._id);
      asset.modified.should.be.true;

      return post.remove();
    }).finally(function() {
      hexo.config.post_asset_folder = false;

      return Promise.all([
        fs.unlink(file.source),
        fs.unlink(assetPath)
      ]);
    });
  });

  it('post - post_asset_folder disabled', function() {
    hexo.config.post_asset_folder = false;

    var file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    var assetId = 'source/_posts/foo/bar.jpg';
    var assetPath = pathFn.join(hexo.base_dir, assetId);

    return Promise.all([
      fs.writeFile(file.source, ''),
      fs.writeFile(assetPath, '')
    ]).then(function() {
      return process(file);
    }).then(function() {
      var post = Post.findOne({source: file.path});
      should.not.exist(PostAsset.findById(assetId));

      return post.remove();
    }).finally(function() {
      return Promise.all([
        fs.unlink(file.source),
        fs.unlink(assetPath)
      ]);
    });
  });

  it('post - parse date', function() {
    var body = [
      'title: "Hello world"',
      'date: Apr 24 2014',
      'updated: May 5 2015',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(function() {
      return process(file);
    }).then(function() {
      var post = Post.findOne({source: file.path});

      post.date.format(dateFormat).should.eql('2014-04-24 00:00:00');
      post.updated.format(dateFormat).should.eql('2015-05-05 00:00:00');

      return post.remove();
    }).finally(function() {
      return fs.unlink(file.source);
    });
  });

  it('post - use file stats instead if date is invalid', function() {
    var body = [
      'title: "Hello world"',
      'date: yomama',
      'updated: isfat',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(function() {
      return Promise.all([
        file.stat(),
        process(file)
      ]);
    }).spread(function(stats) {
      var post = Post.findOne({source: file.path});

      post.date.toDate().setMilliseconds(0).should.eql(stats.birthtime.setMilliseconds(0));
      post.updated.toDate().setMilliseconds(0).should.eql(stats.mtime.setMilliseconds(0));

      return post.remove();
    }).finally(function() {
      return fs.unlink(file.source);
    });
  });

  it('post - timezone', function() {
    var body = [
      'title: "Hello world"',
      'date: 2014-04-24',
      'updated: 2015-05-05',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    hexo.config.timezone = 'UTC';

    return fs.writeFile(file.source, body).then(function() {
      return process(file);
    }).then(function() {
      var post = Post.findOne({source: file.path});

      post.date.utc().format(dateFormat).should.eql('2014-04-24 00:00:00');
      post.updated.utc().format(dateFormat).should.eql('2015-05-05 00:00:00');

      return post.remove();
    }).finally(function() {
      hexo.config.timezone = '';
      return fs.unlink(file.source);
    });
  });

  it('post - new_post_name timezone', function() {
    var body = [
      'title: "Hello world"',
      '---'
    ].join('\n');

    var file = newFile({
      path: '2006/01/02/foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    hexo.config.new_post_name = ':year/:month/:day/:title';
    hexo.config.timezone = 'UTC';

    return fs.writeFile(file.source, body).then(function() {
      return process(file);
    }).then(function() {
      var post = Post.findOne({source: file.path});

      post.date.utc().format(dateFormat).should.eql('2006-01-02 00:00:00');

      return post.remove();
    }).finally(function() {
      hexo.config.new_post_name = newPostName;
      hexo.config.timezone = '';

      return fs.unlink(file.source);
    });
  });

  it('post - permalink', function() {
    var body = [
      'title: "Hello world"',
      'permalink: foooo',
      '---'
    ].join('\n');

    var file = newFile({
      path: 'test.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(function() {
      return process(file);
    }).then(function() {
      var post = Post.findOne({source: file.path});
      post.slug.should.eql('foooo');

      return post.remove();
    }).finally(function() {
      return fs.unlink(file.source);
    });
  });
});
