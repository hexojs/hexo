const should = require('chai').should(); // eslint-disable-line strict
const pathFn = require('path');
const fs = require('hexo-fs');
const Promise = require('bluebird');
const defaultConfig = require('../../../lib/hexo/default_config');

const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const newPostName = defaultConfig.new_post_name;

describe('post', () => {
  const Hexo = require('../../../lib/hexo');
  const baseDir = pathFn.join(__dirname, 'post_test');
  const hexo = new Hexo(baseDir);
  const post = require('../../../lib/plugins/processor/post')(hexo);
  const process = Promise.method(post.process.bind(hexo));
  const pattern = post.pattern;
  const source = hexo.source;
  const File = source.File;
  const PostAsset = hexo.model('PostAsset');
  const Post = hexo.model('Post');

  function newFile(options) {
    const path = options.path;

    options.path = (options.published ? '_posts' : '_drafts') + '/' + path;
    options.source = pathFn.join(source.base, options.path);

    options.params = {
      published: options.published,
      path,
      renderable: options.renderable
    };

    return new File(options);
  }

  before(() => fs.mkdirs(baseDir).then(() => hexo.init()));

  after(() => fs.rmdir(baseDir));

  it('pattern', () => {
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

  it('asset - post_asset_folder disabled', () => {
    hexo.config.post_asset_folder = false;

    const file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'create',
      renderable: false
    });

    return process(file).then(() => {
      const id = 'source/' + file.path;
      should.not.exist(PostAsset.findById(id));
    });
  });

  it('asset - type: create', () => {
    hexo.config.post_asset_folder = true;

    const file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'create',
      renderable: false
    });

    let postId;

    return Promise.all([
      Post.insert({
        source: '_posts/foo.html',
        slug: 'foo'
      }),
      fs.writeFile(file.source, 'test')
    ]).spread(doc => {
      postId = doc._id;
      return process(file);
    }).then(() => {
      const id = 'source/' + file.path;
      const asset = PostAsset.findById(id);

      asset._id.should.eql(id);
      asset.post.should.eql(postId);
      asset.modified.should.be.true;
      asset.renderable.should.be.false;
    }).finally(() => {
      hexo.config.post_asset_folder = false;

      return Promise.all([
        Post.removeById(postId),
        fs.unlink(file.source)
      ]);
    });
  });

  it('asset - type: update', () => {
    hexo.config.post_asset_folder = true;

    const file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'update',
      renderable: false
    });

    const id = 'source/' + file.path;
    let postId;

    return Promise.all([
      Post.insert({
        source: '_posts/foo.html',
        slug: 'foo'
      }),
      fs.writeFile(file.source, 'test')
    ]).spread(post => {
      postId = post._id;

      return PostAsset.insert({
        _id: id,
        slug: file.path,
        modified: false,
        post: postId
      });
    }).then(() => process(file)).then(() => {
      const asset = PostAsset.findById(id);
      asset.modified.should.be.true;
    }).finally(() => {
      hexo.config.post_asset_folder = false;

      return Promise.all([
        Post.removeById(postId),
        fs.unlink(file.source)
      ]);
    });
  });

  it('asset - type: skip', () => {
    hexo.config.post_asset_folder = true;

    const file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'skip',
      renderable: false
    });

    const id = 'source/' + file.path;
    let postId;

    return Promise.all([
      Post.insert({
        source: '_posts/foo.html',
        slug: 'foo'
      }),
      fs.writeFile(file.source, 'test')
    ]).spread(post => {
      postId = post._id;

      return PostAsset.insert({
        _id: id,
        slug: file.path,
        modified: false,
        post: postId
      });
    }).then(() => process(file)).then(() => {
      const asset = PostAsset.findById(id);
      asset.modified.should.be.false;
    }).finally(() => {
      hexo.config.post_asset_folder = false;

      return Promise.all([
        Post.removeById(postId),
        fs.unlink(file.source)
      ]);
    });
  });

  it('asset - type: delete', () => {
    hexo.config.post_asset_folder = true;

    const file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'delete',
      renderable: false
    });

    const id = 'source/' + file.path;
    let postId;

    return Post.insert({
      source: '_posts/foo.html',
      slug: 'foo'
    }).then(post => {
      postId = post._id;

      return PostAsset.insert({
        _id: id,
        slug: file.path,
        modified: false,
        post: postId
      });
    }).then(() => process(file)).then(() => {
      should.not.exist(PostAsset.findById(id));
    }).finally(() => {
      hexo.config.post_asset_folder = false;
      return Post.removeById(postId);
    });
  });

  it('asset - skip if can\'t find a matching post', () => {
    hexo.config.post_asset_folder = true;

    const file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'create',
      renderable: false
    });

    const id = 'source/' + file.path;

    return fs.writeFile(file.source, 'test').then(() => process(file)).then(() => {
      should.not.exist(PostAsset.findById(id));
    }).finally(() => {
      hexo.config.post_asset_folder = false;

      return fs.unlink(file.source);
    });
  });

  it('asset - the related post has been deleted', () => {
    hexo.config.post_asset_folder = true;

    const file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'update',
      renderable: false
    });

    const id = 'source/' + file.path;

    return Promise.all([
      fs.writeFile(file.source, 'test'),
      PostAsset.insert({
        _id: id,
        slug: file.path
      })
    ]).then(() => process(file)).then(() => {
      should.not.exist(PostAsset.findById(id));
    }).finally(() => {
      hexo.config.post_asset_folder = false;

      return fs.unlink(file.source);
    });
  });

  it('post - type: create', () => {
    const body = [
      'title: "Hello world"',
      'date: 2006-01-02 15:04:05',
      'updated: 2014-12-13 01:02:03',
      '---',
      'The quick brown fox jumps over the lazy dog'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const post = Post.findOne({source: file.path});

      post.title.should.eql('Hello world');
      post.date.format(dateFormat).should.eql('2006-01-02 15:04:05');
      post.updated.format(dateFormat).should.eql('2014-12-13 01:02:03');
      post._content.should.eql('The quick brown fox jumps over the lazy dog');
      post.source.should.eql(file.path);
      post.raw.should.eql(body);
      post.slug.should.eql('foo');
      post.published.should.be.true;

      return post.remove();
    }).finally(() => fs.unlink(file.source));
  });

  it('post - type: update', () => {
    const body = [
      'title: "New world"',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'update',
      renderable: true
    });

    let id;

    return Promise.all([
      Post.insert({source: file.path, slug: 'foo'}),
      fs.writeFile(file.source, body)
    ]).spread(doc => {
      id = doc._id;
      return process(file);
    }).then(() => {
      const post = Post.findOne({source: file.path});

      post._id.should.eql(id);
      post.title.should.eql('New world');

      return post.remove();
    }).finally(() => fs.unlink(file.source));
  });

  it('post - type: delete', () => {
    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'delete',
      renderable: true
    });

    return Post.insert({
      source: file.path,
      slug: 'foo'
    }).then(() => process(file)).then(() => {
      should.not.exist(Post.findOne({source: file.path}));
    });
  });

  it('post - parse file name', () => {
    const body = [
      'title: "Hello world"',
      '---'
    ].join('\n');

    const file = newFile({
      path: '2006/01/02/foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    hexo.config.new_post_name = ':year/:month/:day/:title';

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const post = Post.findOne({source: file.path});

      post.slug.should.eql('foo');
      post.date.format('YYYY-MM-DD').should.eql('2006-01-02');

      return post.remove();
    }).finally(() => {
      hexo.config.new_post_name = newPostName;
      return fs.unlink(file.source);
    });
  });

  it('post - extra data in file name', () => {
    const body = [
      'title: "Hello world"',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'zh/foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    hexo.config.new_post_name = ':lang/:title';

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const post = Post.findOne({source: file.path});

      post.lang.should.eql('zh');

      return post.remove();
    }).finally(() => {
      hexo.config.new_post_name = newPostName;
      return fs.unlink(file.source);
    });
  });

  it('post - file name does not match to the config', () => {
    const body = [
      'title: "Hello world"',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    hexo.config.new_post_name = ':year/:month/:day/:title';

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const post = Post.findOne({source: file.path});

      post.slug.should.eql('foo');

      return post.remove();
    }).finally(() => {
      hexo.config.new_post_name = newPostName;
      return fs.unlink(file.source);
    });
  });

  it('post - published', () => {
    const body = [
      'title: "Hello world"',
      'published: false',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'zh/foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const post = Post.findOne({source: file.path});

      post.published.should.be.false;

      return post.remove();
    }).finally(() => fs.unlink(file.source));
  });

  it('post - always set published: false for drafts', () => {
    const body = [
      'title: "Hello world"',
      'published: true',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: false,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const post = Post.findOne({source: file.path});

      post.published.should.be.false;

      return post.remove();
    }).finally(() => fs.unlink(file.source));
  });

  it('post - use the status of the source file if date not set', () => {
    const body = [
      'title: "Hello world"',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => Promise.all([
      file.stat(),
      process(file)
    ])).spread(stats => {
      const post = Post.findOne({source: file.path});

      post.date.toDate().setMilliseconds(0).should.eql(stats.birthtime.setMilliseconds(0));
      post.updated.toDate().setMilliseconds(0).should.eql(stats.mtime.setMilliseconds(0));

      return post.remove();
    }).finally(() => fs.unlink(file.source));
  });

  it('post - photo is an alias for photos', () => {
    const body = [
      'title: "Hello world"',
      'photo:',
      '- http://hexo.io/foo.jpg',
      '- http://hexo.io/bar.png',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const post = Post.findOne({source: file.path});

      post.photos.should.eql([
        'http://hexo.io/foo.jpg',
        'http://hexo.io/bar.png'
      ]);

      should.not.exist(post.photo);

      return post.remove();
    }).finally(() => fs.unlink(file.source));
  });

  it('post - photos (not array)', () => {
    const body = [
      'title: "Hello world"',
      'photos: http://hexo.io/foo.jpg',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const post = Post.findOne({source: file.path});

      post.photos.should.eql([
        'http://hexo.io/foo.jpg'
      ]);

      return post.remove();
    }).finally(() => fs.unlink(file.source));
  });

  it('post - link without title', () => {
    const body = [
      'link: http://hexo.io/',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const post = Post.findOne({source: file.path});

      post.link.should.eql('http://hexo.io/');
      post.title.should.eql('hexo.io');

      return post.remove();
    }).finally(() => fs.unlink(file.source));
  });

  it('post - category is an alias for categories', () => {
    const body = [
      'title: "Hello world"',
      'category:',
      '- foo',
      '- bar',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const post = Post.findOne({source: file.path});

      should.not.exist(post.category);
      post.categories.map(item => item.name).should.eql(['foo', 'bar']);

      return post.remove();
    }).finally(() => fs.unlink(file.source));
  });

  it('post - categories (not array)', () => {
    const body = [
      'title: "Hello world"',
      'categories: foo',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const post = Post.findOne({source: file.path});

      post.categories.map(item => item.name).should.eql(['foo']);

      return post.remove();
    }).finally(() => fs.unlink(file.source));
  });

  it('post - categories (multiple hierarchies)', () => {
    const body = [
      'title: "Hello world"',
      'categories:',
      '- foo',
      '- [bar, baz]',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const post = Post.findOne({source: file.path});

      post.categories.map(item => item.name).should.eql(['foo', 'bar', 'baz']);

      return post.remove();
    }).finally(() => fs.unlink(file.source));
  });

  it('post - tag is an alias for tags', () => {
    const body = [
      'title: "Hello world"',
      'tags:',
      '- foo',
      '- bar',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const post = Post.findOne({source: file.path});

      should.not.exist(post.tag);
      post.tags.map(item => item.name).should.have.members(['foo', 'bar']);

      return post.remove();
    }).finally(() => fs.unlink(file.source));
  });

  it('post - tags (not array)', () => {
    const body = [
      'title: "Hello world"',
      'tags: foo',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const post = Post.findOne({source: file.path});

      post.tags.map(item => item.name).should.eql(['foo']);

      return post.remove();
    }).finally(() => fs.unlink(file.source));
  });

  it('post - post_asset_folder enabled', () => {
    hexo.config.post_asset_folder = true;

    const body = [
      'title: "Hello world"',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    const assetId = 'source/_posts/foo/bar.jpg';
    const assetPath = pathFn.join(hexo.base_dir, assetId);

    return Promise.all([
      fs.writeFile(file.source, body),
      fs.writeFile(assetPath, '')
    ]).then(() => process(file)).then(() => {
      const post = Post.findOne({source: file.path});
      const asset = PostAsset.findById(assetId);

      asset._id.should.eql(assetId);
      asset.post.should.eql(post._id);
      asset.modified.should.be.true;

      return post.remove();
    }).finally(() => {
      hexo.config.post_asset_folder = false;

      return Promise.all([
        fs.unlink(file.source),
        fs.unlink(assetPath)
      ]);
    });
  });

  it('post - post_asset_folder disabled', () => {
    hexo.config.post_asset_folder = false;

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    const assetId = 'source/_posts/foo/bar.jpg';
    const assetPath = pathFn.join(hexo.base_dir, assetId);

    return Promise.all([
      fs.writeFile(file.source, ''),
      fs.writeFile(assetPath, '')
    ]).then(() => process(file)).then(() => {
      const post = Post.findOne({source: file.path});
      should.not.exist(PostAsset.findById(assetId));

      return post.remove();
    }).finally(() => Promise.all([
      fs.unlink(file.source),
      fs.unlink(assetPath)
    ]));
  });

  it('post - parse date', () => {
    const body = [
      'title: "Hello world"',
      'date: Apr 24 2014',
      'updated: May 5 2015',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const post = Post.findOne({source: file.path});

      post.date.format(dateFormat).should.eql('2014-04-24 00:00:00');
      post.updated.format(dateFormat).should.eql('2015-05-05 00:00:00');

      return post.remove();
    }).finally(() => fs.unlink(file.source));
  });

  it('post - use file stats instead if date is invalid', () => {
    const body = [
      'title: "Hello world"',
      'date: yomama',
      'updated: isfat',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => Promise.all([
      file.stat(),
      process(file)
    ])).spread(stats => {
      const post = Post.findOne({source: file.path});

      post.date.toDate().setMilliseconds(0).should.eql(stats.birthtime.setMilliseconds(0));
      post.updated.toDate().setMilliseconds(0).should.eql(stats.mtime.setMilliseconds(0));

      return post.remove();
    }).finally(() => fs.unlink(file.source));
  });

  it('post - timezone', () => {
    const body = [
      'title: "Hello world"',
      'date: 2014-04-24',
      'updated: 2015-05-05',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    hexo.config.timezone = 'UTC';

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const post = Post.findOne({source: file.path});

      post.date.utc().format(dateFormat).should.eql('2014-04-24 00:00:00');
      post.updated.utc().format(dateFormat).should.eql('2015-05-05 00:00:00');

      return post.remove();
    }).finally(() => {
      hexo.config.timezone = '';
      return fs.unlink(file.source);
    });
  });

  it('post - new_post_name timezone', () => {
    const body = [
      'title: "Hello world"',
      '---'
    ].join('\n');

    const file = newFile({
      path: '2006/01/02/foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    hexo.config.new_post_name = ':year/:month/:day/:title';
    hexo.config.timezone = 'UTC';

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const post = Post.findOne({source: file.path});

      post.date.utc().format(dateFormat).should.eql('2006-01-02 00:00:00');

      return post.remove();
    }).finally(() => {
      hexo.config.new_post_name = newPostName;
      hexo.config.timezone = '';

      return fs.unlink(file.source);
    });
  });

  it('post - permalink', () => {
    const body = [
      'title: "Hello world"',
      'permalink: foooo',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'test.html',
      published: true,
      type: 'create',
      renderable: true
    });

    return fs.writeFile(file.source, body).then(() => process(file)).then(() => {
      const post = Post.findOne({source: file.path});
      post.slug.should.eql('foooo');

      return post.remove();
    }).finally(() => fs.unlink(file.source));
  });
});
