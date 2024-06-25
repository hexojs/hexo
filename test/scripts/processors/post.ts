
import { join } from 'path';
import { mkdirs, rmdir, unlink, writeFile } from 'hexo-fs';
// @ts-ignore
import Promise from 'bluebird';
import defaultConfig from '../../../lib/hexo/default_config';
import Hexo from '../../../lib/hexo';
import posts from '../../../lib/plugins/processor/post';
import chai from 'chai';
const should = chai.should();
type PostParams = Parameters<ReturnType<typeof posts>['process']>
type PostReturn = ReturnType<ReturnType<typeof posts>['process']>

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

describe('post', () => {
  const baseDir = join(__dirname, 'post_test');
  const hexo = new Hexo(baseDir);
  const post = posts(hexo);
  const process: (...args: PostParams) => Promise<PostReturn> = Promise.method(post.process.bind(hexo));
  const { pattern } = post;
  const { source } = hexo;
  const { File } = source;
  const PostAsset = hexo.model('PostAsset');
  const Post = hexo.model('Post');

  function newFile(options) {
    const { path } = options;

    options.path = (options.published ? '_posts' : '_drafts') + '/' + path;
    options.source = join(source.base, options.path);

    options.params = {
      published: options.published,
      path,
      renderable: options.renderable
    };

    return new File(options);
  }

  before(async () => {
    await mkdirs(baseDir);
    hexo.init();
  });

  beforeEach(() => { hexo.config = Object.assign({}, defaultConfig); });

  after(() => rmdir(baseDir));

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

    // Skip render in the subdir assets if post_asset_folder is enabled
    hexo.config.post_asset_folder = true;
    pattern.match('_posts/foo/subdir/bar.html').should.have.property('renderable', false);
    pattern.match('_posts/foo/subdir/bar.css').should.have.property('renderable', false);
    pattern.match('_posts/foo/subdir/bar.js').should.have.property('renderable', false);
    hexo.config.post_asset_folder = false;

    // Render in the subdir assets if post_asset_folder is disabled
    pattern.match('_posts/foo/subdir/bar.html').should.have.property('renderable', true);
    pattern.match('_posts/foo/subdir/bar.css').should.have.property('renderable', true);
    pattern.match('_posts/foo/subdir/bar.js').should.have.property('renderable', true);
  });

  it('asset - post_asset_folder disabled', async () => {
    hexo.config.post_asset_folder = false;

    const file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'create',
      renderable: false
    });

    await process(file);
    const id = 'source/' + file.path;
    should.not.exist(PostAsset.findById(id));
  });

  it('asset - type: create', async () => {
    hexo.config.post_asset_folder = true;

    const file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'create',
      renderable: false
    });


    const doc = await Post.insert({
      source: '_posts/foo.html',
      slug: 'foo'
    });
    await writeFile(file.source, 'test');
    const postId = doc._id;
    await process(file);

    const id = 'source/' + file.path;
    const asset = PostAsset.findById(id);

    asset._id.should.eql(id);
    asset.post.should.eql(postId);
    asset.modified.should.be.true;
    asset.renderable.should.be.false;

    await Promise.all([
      Post.removeById(postId),
      unlink(file.source)
    ]);
  });

  it('asset - type: update', async () => {
    hexo.config.post_asset_folder = true;

    const file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'update',
      renderable: false
    });

    const id = 'source/' + file.path;

    const post = await Post.insert({
      source: '_posts/foo.html',
      slug: 'foo'
    });
    await writeFile(file.source, 'test');
    const postId = post._id;

    await PostAsset.insert({
      _id: id,
      slug: file.path,
      modified: false,
      post: postId
    });
    await process(file);
    const asset = PostAsset.findById(id);
    asset.modified.should.be.true;

    await Promise.all([
      Post.removeById(postId),
      unlink(file.source)
    ]);
  });

  it('asset - type: skip', async () => {
    hexo.config.post_asset_folder = true;

    const file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'skip',
      renderable: false
    });

    const id = 'source/' + file.path;

    const post = await Post.insert({
      source: '_posts/foo.html',
      slug: 'foo'
    });
    await writeFile(file.source, 'test');
    const postId = post._id;

    await PostAsset.insert({
      _id: id,
      slug: file.path,
      modified: false,
      post: postId
    });
    await process(file);
    const asset = PostAsset.findById(id);
    asset.modified.should.be.false;

    await Promise.all([
      Post.removeById(postId),
      unlink(file.source)
    ]);
  });

  it('asset - type: delete', async () => {
    hexo.config.post_asset_folder = true;

    const file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'delete',
      renderable: false
    });

    const id = 'source/' + file.path;

    const post = await Post.insert({
      source: '_posts/foo.html',
      slug: 'foo'
    });
    const postId = post._id;

    await PostAsset.insert({
      _id: id,
      slug: file.path,
      modified: false,
      post: postId
    });
    await process(file);
    should.not.exist(PostAsset.findById(id));

    Post.removeById(postId);
  });

  it('asset - type: delete - not exist', async () => {
    hexo.config.post_asset_folder = true;

    const file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'delete',
      renderable: false
    });

    const id = 'source/' + file.path;

    const post = await Post.insert({
      source: '_posts/foo.html',
      slug: 'foo'
    });
    const postId = post._id;

    await process(file);
    should.not.exist(PostAsset.findById(id));

    Post.removeById(postId);
  });


  it('asset - skip if can\'t find a matching post', async () => {
    hexo.config.post_asset_folder = true;

    const file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'create',
      renderable: false
    });

    const id = 'source/' + file.path;

    await writeFile(file.source, 'test');
    await process(file);
    should.not.exist(PostAsset.findById(id));

    unlink(file.source);
  });

  it('asset - the related post has been deleted', async () => {
    hexo.config.post_asset_folder = true;

    const file = newFile({
      path: 'foo/bar.jpg',
      published: true,
      type: 'update',
      renderable: false
    });

    const id = 'source/' + file.path;

    await Promise.all([
      writeFile(file.source, 'test'),
      PostAsset.insert({
        _id: id,
        slug: file.path
      })
    ]);
    await process(file);
    should.not.exist(PostAsset.findById(id));

    unlink(file.source);
  });

  it('post - type: create', async () => {
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

    await writeFile(file.source, body);
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.title.should.eql('Hello world');
    post.date.format(dateFormat).should.eql('2006-01-02 15:04:05');
    post.updated.format(dateFormat).should.eql('2014-12-13 01:02:03');
    post._content.should.eql('The quick brown fox jumps over the lazy dog');
    post.source.should.eql(file.path);
    post.raw.should.eql(body);
    post.slug.should.eql('foo');
    post.published.should.be.true;

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - type: update', async () => {
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


    const doc = await Post.insert({ source: file.path, slug: 'foo' });
    await writeFile(file.source, body);
    const id = doc._id;
    await process(file);
    const post = Post.findOne({ source: file.path });

    post._id!.should.eql(id);
    post.title.should.eql('New world');

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - type: skip', async () => {
    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'skip',
      renderable: true
    });

    await Post.insert({
      source: file.path,
      slug: 'foo'
    });
    await process(file);
    const post = Post.findOne({ source: file.path });
    should.exist(post);
    post.remove();
  });

  it('post - type: delete - not exist', async () => {
    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'delete',
      renderable: true
    });

    await process(file);
    should.not.exist(Post.findOne({ source: file.path }));
  });

  it('post - type: delete', async () => {
    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'delete',
      renderable: true
    });

    await Post.insert({
      source: file.path,
      slug: 'foo'
    });
    await process(file);
    should.not.exist(Post.findOne({ source: file.path }));
  });

  it('post - type: delete - not exist', async () => {
    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'delete',
      renderable: true
    });

    await process(file);
    should.not.exist(Post.findOne({ source: file.path }));
  });

  it('post - parse file name', async () => {
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

    await writeFile(file.source, body);
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.slug.should.eql('foo');
    post.date.format('YYYY-MM-DD').should.eql('2006-01-02');

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - parse unusual file name', async () => {
    const body = [
      'title: "Hello world"',
      '---'
    ].join('\n');

    const file = newFile({
      path: '20060102.html',
      published: true,
      type: 'create',
      renderable: true
    });

    hexo.config.new_post_name = ':year:month:day';

    await writeFile(file.source, body);
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.slug.should.eql('20060102');
    post.date.format('YYYY-MM-DD').should.eql('2006-01-02');

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - extra data in file name', async () => {
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

    await writeFile(file.source, body);
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.lang.should.eql('zh');

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - file name does not match to the config', async () => {
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

    await writeFile(file.source, body);
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.slug.should.eql('foo');

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - published', async () => {
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

    await writeFile(file.source, body);
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.published.should.be.false;

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - always set published: false for drafts', async () => {
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

    await writeFile(file.source, body);
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.published.should.be.false;

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - use the status of the source file if date not set', async () => {
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

    await writeFile(file.source, body);
    const stats = await file.stat();
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.date.toDate().setMilliseconds(0).should.eql(stats.birthtime.setMilliseconds(0));
    post.updated.toDate().setMilliseconds(0).should.eql(stats.mtime.setMilliseconds(0));

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - use the date for updated if updated_option = date', async () => {
    const body = [
      'date: 2011-4-5 14:19:19',
      'title: "Hello world"',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    hexo.config.updated_option = 'date';

    await writeFile(file.source, body);
    const stats = await file.stat();
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.updated.toDate().setMilliseconds(0).should.eql(post.date.toDate().setMilliseconds(0));
    post.updated.toDate().setMilliseconds(0).should.not.eql(stats.mtime.setMilliseconds(0));

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - use the status of the source file if updated_option = mtime', async () => {
    const body = [
      'date: 2011-4-5 14:19:19',
      'title: "Hello world"',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    hexo.config.updated_option = 'mtime';

    await writeFile(file.source, body);
    const stats = await file.stat();
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.updated.toDate().setMilliseconds(0).should.eql(stats.mtime.setMilliseconds(0));
    post.updated.toDate().setMilliseconds(0).should.not.eql(post.date.toDate().setMilliseconds(0));

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - updated shouldn\'t exists if updated_option = empty', async () => {
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

    hexo.config.updated_option = 'empty';

    await writeFile(file.source, body);
    await process(file);
    const post = Post.findOne({ source: file.path });

    should.not.exist(post.updated);

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - photo is an alias for photos', async () => {
    const body = [
      'title: "Hello world"',
      'photo:',
      '- https://hexo.io/foo.jpg',
      '- https://hexo.io/bar.png',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    await writeFile(file.source, body);
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.photos.should.eql([
      'https://hexo.io/foo.jpg',
      'https://hexo.io/bar.png'
    ]);

    should.not.exist(post.photo);

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - photos (not array)', async () => {
    const body = [
      'title: "Hello world"',
      'photos: https://hexo.io/foo.jpg',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    await writeFile(file.source, body);
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.photos.should.eql([
      'https://hexo.io/foo.jpg'
    ]);

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - without title', async () => {
    const body = '';

    const file = newFile({
      path: 'foo.md',
      published: true,
      type: 'create',
      renderable: true
    });

    await writeFile(file.source, body);
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.title.should.eql('');

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  // use `slug` as `title` of post when `title` is not specified.
  // https://github.com/hexojs/hexo/issues/5372
  it('post - without title - use filename', async () => {
    hexo.config.use_slug_as_post_title = true;

    const body = '';

    const file = newFile({
      path: 'bar.md',
      published: true,
      type: 'create',
      renderable: true
    });

    await writeFile(file.source, body);
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.title.should.eql('bar');

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - category is an alias for categories', async () => {
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

    await writeFile(file.source, body);
    await process(file);
    const post = Post.findOne({ source: file.path });

    should.not.exist(post.category);
    post.categories.map(item => item.name).should.eql(['foo', 'bar']);

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - categories (not array)', async () => {
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

    await writeFile(file.source, body);
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.categories.map(item => item.name).should.eql(['foo']);

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - categories (multiple hierarchies)', async () => {
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

    await writeFile(file.source, body);
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.categories.map(item => item.name).should.eql(['foo', 'bar', 'baz']);

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - tag is an alias for tags', async () => {
    const body = [
      'title: "Hello world"',
      'tag:',
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

    await writeFile(file.source, body);
    await process(file);
    const post = Post.findOne({ source: file.path });

    should.not.exist(post.tag);
    post.tags.map(item => item.name).should.have.members(['foo', 'bar']);

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - tags (not array)', async () => {
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

    await writeFile(file.source, body);
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.tags.map(item => item.name).should.eql(['foo']);

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - post_asset_folder enabled', async () => {
    hexo.config.post_asset_folder = true;
    hexo.config.exclude = ['**.png'];
    hexo.config.include = ['**/_fizz.*'];

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

    const assetFiles = [
      'bar.jpg',
      'baz.png',
      '_fizz.jpg',
      '_buzz.jpg'
    ].map(filename => {
      const id = `source/_posts/foo/${filename}`;
      const path = join(hexo.base_dir, id);
      const contents = filename.replace(/\.\w+$/, '');
      return {
        id,
        path,
        contents
      };
    });

    await Promise.all([
      writeFile(file.source, body),
      ...assetFiles.map(obj => writeFile(obj.path, obj.contents))
    ]);
    await process(file);
    const post = Post.findOne({ source: file.path });
    const assets = assetFiles.map(obj => PostAsset.findById(obj.id));

    [assets[0]].should.not.eql([undefined]);
    assets[0]._id.should.eql(assetFiles[0].id);
    assets[0].post.should.eql(post._id);
    assets[0].modified.should.be.true;

    [assets[1]].should.eql([undefined]);

    [assets[2]].should.not.eql([undefined]);
    assets[2]._id.should.eql(assetFiles[2].id);
    assets[2].post.should.eql(post._id);
    assets[2].modified.should.be.true;

    [assets[3]].should.eql([undefined]);

    post.remove();

    await Promise.all([
      unlink(file.source),
      ...assetFiles.map(obj => unlink(obj.path))
    ]);
  });

  it('post - post_asset_folder enabled with unpublished posts', async () => {
    hexo.config.post_asset_folder = true;

    const body = [
      'title: "Hello world"',
      'published: false',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    const assetId = 'source/_posts/foo/bar.jpg';
    const assetPath = join(hexo.base_dir, assetId);

    await Promise.all([
      writeFile(file.source, body),
      writeFile(assetPath, '')
    ]);

    // drafts disabled - no draft assets should be generated
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.published.should.be.false;
    should.not.exist(PostAsset.findById(assetId));

    // drafts enabled - all assets should be generated
    hexo.config.render_drafts = true;
    await process(file);

    should.exist(PostAsset.findById(assetId));

    hexo.config.render_drafts = false;

    await Promise.all([
      post.remove(),
      unlink(file.source),
      unlink(assetPath)
    ]);
  });

  it('post - delete existing draft assets if draft posts are hidden', async () => {
    hexo.config.post_asset_folder = true;

    const body = [
      'title: "Hello world"',
      'published: false',
      '---'
    ].join('\n');

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    const assetId = 'source/_posts/foo/bar.jpg';
    const assetPath = join(hexo.base_dir, assetId);

    await Promise.all([
      writeFile(file.source, body),
      writeFile(assetPath, '')
    ]);

    // drafts disabled - no draft assets should be generated
    await process(file);
    const post = Post.findOne({ source: file.path });
    await PostAsset.insert({
      _id: 'source/_posts/foo/bar.jpg',
      slug: 'bar.jpg',
      post: post._id
    });
    await process(file);

    post.published.should.be.false;
    should.not.exist(PostAsset.findById(assetId));

    await Promise.all([
      post.remove(),
      unlink(file.source),
      unlink(assetPath)
    ]);
  });

  it('post - post_asset_folder disabled', async () => {
    hexo.config.post_asset_folder = false;

    const file = newFile({
      path: 'foo.html',
      published: true,
      type: 'create',
      renderable: true
    });

    const assetId = 'source/_posts/foo/bar.jpg';
    const assetPath = join(hexo.base_dir, assetId);

    await Promise.all([
      writeFile(file.source, ''),
      writeFile(assetPath, '')
    ]);
    await process(file);
    const post = Post.findOne({ source: file.path });
    should.not.exist(PostAsset.findById(assetId));

    post.remove();
    await Promise.all([
      unlink(file.source),
      unlink(assetPath)
    ]);
  });

  it('post - parse date', async () => {
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

    await writeFile(file.source, body);
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.date.format(dateFormat).should.eql('2014-04-24 00:00:00');
    post.updated.format(dateFormat).should.eql('2015-05-05 00:00:00');

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - use file stats instead if date is invalid', async () => {
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

    await writeFile(file.source, body);
    const stats = await file.stat();
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.date.toDate().setMilliseconds(0).should.eql(stats.birthtime.setMilliseconds(0));
    post.updated.toDate().setMilliseconds(0).should.eql(stats.mtime.setMilliseconds(0));

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('post - timezone', async () => {
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

    await writeFile(file.source, body);
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.date.utc().format(dateFormat).should.eql('2014-04-24 00:00:00');
    post.updated.utc().format(dateFormat).should.eql('2015-05-05 00:00:00');

    post.remove();
    return unlink(file.source);
  });

  it('post - new_post_name timezone', async () => {
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

    await writeFile(file.source, body);
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.date.utc().format(dateFormat).should.eql('2006-01-02 00:00:00');

    post.remove();

    unlink(file.source);
  });

  it('post - permalink', async () => {
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

    await writeFile(file.source, body);
    await process(file);
    const post = Post.findOne({ source: file.path });

    post.__permalink.should.eql('foooo');

    return Promise.all([
      post.remove(),
      unlink(file.source)
    ]);
  });

  it('asset - post - common render', async () => {
    hexo.config.post_asset_folder = true;

    const file = newFile({
      path: 'foo.md',
      published: true,
      type: 'create',
      renderable: true
    });

    const assetFile = newFile({
      path: 'foo/test.yml',
      published: true,
      type: 'create'
    });

    await Promise.all([
      writeFile(file.source, 'test'),
      writeFile(assetFile.source, 'test')
    ]);
    await process(file);
    const id = 'source/' + assetFile.path;
    const post = Post.findOne({ source: file.path });
    PostAsset.findById(id).renderable.should.be.true;

    hexo.config.post_asset_folder = false;

    return Promise.all([
      unlink(file.source),
      unlink(assetFile.source),
      post.remove(),
      PostAsset.removeById(id)
    ]);
  });

  it('asset - post - skip render', async () => {
    hexo.config.post_asset_folder = true;
    hexo.config.skip_render = '**.yml' as any;

    const file = newFile({
      path: 'foo.md',
      published: true,
      type: 'create',
      renderable: true
    });

    const assetFile = newFile({
      path: 'foo/test.yml',
      published: true,
      type: 'create'
    });

    await Promise.all([
      writeFile(file.source, 'test'),
      writeFile(assetFile.source, 'test')
    ]);
    await process(file);
    const id = 'source/' + assetFile.path;
    const post = Post.findOne({ source: file.path });
    PostAsset.findById(id).renderable.should.be.false;

    hexo.config.post_asset_folder = false;
    hexo.config.skip_render = '' as any;

    return Promise.all([
      unlink(file.source),
      unlink(assetFile.source),
      post.remove(),
      PostAsset.removeById(id)
    ]);
  });
});
