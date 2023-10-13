'use strict';

const { deepMerge, full_url_for } = require('hexo-util');

describe('Tag', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo();
  const Tag = hexo.model('Tag');
  const Post = hexo.model('Post');
  const PostTag = hexo.model('PostTag');
  const defaults = require('../../../dist/hexo/default_config');

  before(() => hexo.init());

  beforeEach(() => { hexo.config = deepMerge({}, defaults); });

  it('name - required', async () => {
    try {
      await Tag.insert({});
    } catch (err) {
      err.message.should.be.eql('`name` is required!');
    }
  });

  it('slug - virtual', async () => {
    const data = await Tag.insert({
      name: 'foo'
    });
    data.slug.should.eql('foo');

    Tag.removeById(data._id);
  });

  it('slug - tag_map', async () => {
    hexo.config.tag_map = {
      test: 'wat'
    };

    const data = await Tag.insert({
      name: 'test'
    });
    data.slug.should.eql('wat');
    Tag.removeById(data._id);
  });

  it('slug - filename_case: 0', async () => {
    const data = await Tag.insert({
      name: 'WahAHa'
    });
    data.slug.should.eql('WahAHa');

    Tag.removeById(data._id);
  });

  it('slug - filename_case: 1', async () => {
    hexo.config.filename_case = 1;

    const data = await Tag.insert({
      name: 'WahAHa'
    });
    data.slug.should.eql('wahaha');

    Tag.removeById(data._id);
  });

  it('slug - filename_case: 2', async () => {
    hexo.config.filename_case = 2;

    const data = await Tag.insert({
      name: 'WahAHa'
    });

    data.slug.should.eql('WAHAHA');

    Tag.removeById(data._id);
  });

  it('path - virtual', async () => {
    const data = await Tag.insert({
      name: 'foo'
    });

    data.path.should.eql(hexo.config.tag_dir + '/' + data.slug + '/');

    Tag.removeById(data._id);
  });

  it('permalink - virtual', async () => {
    const data = await Tag.insert({
      name: 'foo'
    });

    data.permalink.should.eql(hexo.config.url + '/' + data.path);

    Tag.removeById(data._id);
  });

  it('permalink - trailing_index', async () => {
    hexo.config.pretty_urls.trailing_index = false;
    const data = await Tag.insert({
      name: 'foo'
    });

    data.permalink.should.eql(hexo.config.url + '/' + data.path.replace(/index\.html$/, ''));

    Tag.removeById(data._id);
  });

  it('permalink - trailing_html', async () => {
    hexo.config.pretty_urls.trailing_html = false;
    const data = await Tag.insert({
      name: 'foo'
    });

    data.permalink.should.eql(hexo.config.url + '/' + data.path.replace(/\.html$/, ''));

    Tag.removeById(data._id);
  });

  it('permalink - should be encoded', async () => {
    hexo.config.url = 'http://fôo.com';
    const data = await Tag.insert({
      name: '字'
    });

    data.permalink.should.eql(full_url_for.call(hexo, data.path));

    Tag.removeById(data._id);
  });

  it('posts - virtual', async () => {
    const posts = await Post.insert([
      {source: 'foo.md', slug: 'foo'},
      {source: 'bar.md', slug: 'bar'},
      {source: 'baz.md', slug: 'baz'}
    ]);
    await Promise.all(posts.map(post => post.setTags(['foo'])));

    const tag = Tag.findOne({name: 'foo'});

    function mapper(post) {
      return post._id;
    }

    hexo.locals.invalidate();
    tag.posts.map(mapper).should.eql(posts.map(mapper));
    tag.should.have.lengthOf(posts.length);

    await tag.remove();
    await Promise.all(posts.map(post => post.remove()));
  });

  it('posts - draft', async () => {
    const posts = await Post.insert([
      {source: 'foo.md', slug: 'foo', published: true},
      {source: 'bar.md', slug: 'bar', published: false},
      {source: 'baz.md', slug: 'baz', published: true}
    ]);
    await Promise.all(posts.map(post => post.setTags(['foo'])));

    let tag = Tag.findOne({name: 'foo'});

    function mapper(post) {
      return post._id;
    }

    // draft off
    hexo.locals.invalidate();
    tag.posts.eq(0)._id.should.eql(posts[0]._id);
    tag.posts.eq(1)._id.should.eql(posts[2]._id);
    tag.should.have.lengthOf(2);

    // draft on
    hexo.config.render_drafts = true;
    await Promise.all(posts.map(post => post.setTags(['foo'])));
    tag = Tag.findOne({name: 'foo'});
    hexo.locals.invalidate();
    tag.posts.map(mapper).should.eql(posts.map(mapper));
    tag.should.have.lengthOf(posts.length);
    hexo.config.render_drafts = false;

    await tag.remove();
    await Promise.all(posts.map(post => post.remove()));
  });

  it('posts - future', async () => {
    const now = Date.now();

    const posts = await Post.insert([
      {source: 'foo.md', slug: 'foo', date: now - 3600},
      {source: 'bar.md', slug: 'bar', date: now + 3600},
      {source: 'baz.md', slug: 'baz', date: now}
    ]);
    await Promise.all(posts.map(post => post.setTags(['foo'])));

    let tag = Tag.findOne({name: 'foo'});

    function mapper(post) {
      return post._id;
    }

    // future on
    hexo.config.future = true;
    hexo.locals.invalidate();
    tag.posts.map(mapper).should.eql(posts.map(mapper));
    tag.should.have.lengthOf(posts.length);

    // future off
    hexo.config.future = false;
    await Promise.all(posts.map(post => post.setTags(['foo'])));
    hexo.locals.invalidate();
    tag = Tag.findOne({name: 'foo'});
    tag.posts.eq(0)._id.should.eql(posts[0]._id);
    tag.posts.eq(1)._id.should.eql(posts[2]._id);
    tag.should.have.lengthOf(2);

    await tag.remove();
    await Promise.all(posts.map(post => post.remove()));
  });

  it('check whether a tag exists', async () => {
    let data = await Tag.insert({
      name: 'foo'
    });

    try {
      data = await Tag.insert({
        name: 'foo'
      });
    } catch (err) {
      err.message.should.eql('Tag `foo` has already existed!');
    }

    Tag.removeById(data._id);
  });

  it('remove PostTag references when a tag is removed', async () => {
    const posts = await Post.insert([
      {source: 'foo.md', slug: 'foo'},
      {source: 'bar.md', slug: 'bar'},
      {source: 'baz.md', slug: 'baz'}
    ]);
    await Promise.all(posts.map(post => post.setTags(['foo'])));

    const tag = Tag.findOne({name: 'foo'});
    await Tag.removeById(tag._id);

    PostTag.find({tag_id: tag._id}).should.have.lengthOf(0);

    await Promise.all(posts.map(post => Post.removeById(post._id)));
  });
});
