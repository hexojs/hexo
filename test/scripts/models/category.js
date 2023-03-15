'use strict';

const { deepMerge, full_url_for } = require('hexo-util');

describe('Category', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo();
  const Category = hexo.model('Category');
  const Post = hexo.model('Post');
  const PostCategory = hexo.model('PostCategory');
  const defaults = require('../../../dist/hexo/default_config');

  before(() => hexo.init());

  beforeEach(() => {
    hexo.config = deepMerge({}, defaults);
  });

  it('name - required', async () => {
    try {
      await Category.insert({});
    } catch (err) {
      err.message.should.eql('`name` is required!');
    }
  });

  // it('parent - reference'); missing-unit-test

  it('slug - virtual', async () => {
    const data = await Category.insert({
      name: 'foo'
    });
    data.slug.should.eql('foo');

    Category.removeById(data._id);
  });

  it('slug - category_map', async () => {
    hexo.config.category_map = {
      test: 'wat'
    };

    const data = await Category.insert({
      name: 'test'
    });
    data.slug.should.eql('wat');

    Category.removeById(data._id);
  });

  it('slug - filename_case: 0', async () => {
    const data = await Category.insert({
      name: 'WahAHa'
    });
    data.slug.should.eql('WahAHa');

    Category.removeById(data._id);
  });

  it('slug - filename_case: 1', async () => {
    hexo.config.filename_case = 1;

    const data = await Category.insert({
      name: 'WahAHa'
    });
    data.slug.should.eql('wahaha');

    Category.removeById(data._id);
  });

  it('slug - filename_case: 2', async () => {
    hexo.config.filename_case = 2;

    const data = await Category.insert({
      name: 'WahAHa'
    });

    data.slug.should.eql('WAHAHA');

    Category.removeById(data._id);
  });

  it('slug - parent', async () => {
    let cat = await Category.insert({
      name: 'parent'
    });
    cat = await Category.insert({
      name: 'child',
      parent: cat._id
    });
    cat.slug.should.eql('parent/child');

    await Promise.all([
      Category.removeById(cat._id),
      Category.removeById(cat.parent)
    ]);
  });

  it('path - virtual', async () => {
    const data = await Category.insert({
      name: 'foo'
    });
    data.path.should.eql(hexo.config.category_dir + '/' + data.slug + '/');

    Category.removeById(data._id);
  });

  it('permalink - virtual', async () => {
    const data = await Category.insert({
      name: 'foo'
    });
    data.permalink.should.eql(hexo.config.url + '/' + data.path);

    Category.removeById(data._id);
  });

  it('permalink - trailing_index', async () => {
    hexo.config.pretty_urls.trailing_index = false;

    const data = await Category.insert({
      name: 'foo'
    });
    data.permalink.should.eql(hexo.config.url + '/' + data.path.replace(/index\.html$/, ''));

    Category.removeById(data._id);
  });

  it('permalink - trailing_html', async () => {
    hexo.config.pretty_urls.trailing_html = false;
    const data = await Category.insert({
      name: 'foo'
    });
    data.permalink.should.eql(hexo.config.url + '/' + data.path.replace(/\.html$/, ''));

    Category.removeById(data._id);
  });

  it('permalink - should be encoded', async () => {
    hexo.config.url = 'http://fôo.com';
    const data = await Category.insert({
      name: '字'
    });
    data.permalink.should.eql(full_url_for.call(hexo, data.path));

    Category.removeById(data._id);
  });

  it('posts - virtual', async () => {
    const posts = await Post.insert([
      {source: 'foo.md', slug: 'foo'},
      {source: 'bar.md', slug: 'bar'},
      {source: 'baz.md', slug: 'baz'}
    ]);

    await Promise.all(posts.map(post => post.setCategories(['foo'])));

    const cat = await Category.findOne({name: 'foo'});

    function mapper(post) {
      return post._id;
    }

    hexo.locals.invalidate();
    cat.posts.map(mapper).should.eql(posts.map(mapper));
    cat.should.have.lengthOf(posts.length);

    await cat.remove();
    await Promise.all(posts.map(post => post.remove()));
  });

  it('posts - draft', async () => {
    const posts = await Post.insert([
      {source: 'foo.md', slug: 'foo', published: true},
      {source: 'bar.md', slug: 'bar', published: false},
      {source: 'baz.md', slug: 'baz', published: true}
    ]);

    await Promise.all(posts.map(post => post.setCategories(['foo'])));

    let cat = Category.findOne({name: 'foo'});

    function mapper(post) {
      return post._id;
    }

    // draft off
    hexo.locals.invalidate();
    cat.posts.eq(0)._id.should.eql(posts[0]._id);
    cat.posts.eq(1)._id.should.eql(posts[2]._id);
    cat.should.have.lengthOf(2);

    // draft on
    hexo.config.render_drafts = true;

    await Promise.all(posts.map(post => post.setCategories(['foo'])));
    hexo.locals.invalidate();
    cat = Category.findOne({name: 'foo'});
    cat.posts.map(mapper).should.eql(posts.map(mapper));
    cat.should.have.lengthOf(posts.length);
    hexo.config.render_drafts = false;

    await cat.remove();
    await Promise.all(posts.map(post => post.remove()));

  });

  it('posts - future', async () => {
    const now = Date.now();

    const posts = await Post.insert([
      {source: 'foo.md', slug: 'foo', date: now - 3600},
      {source: 'bar.md', slug: 'bar', date: now + 3600},
      {source: 'baz.md', slug: 'baz', date: now}
    ]);

    await Promise.all(posts.map(post => post.setCategories(['foo'])));

    let cat = Category.findOne({name: 'foo'});

    function mapper(post) {
      return post._id;
    }

    // future on
    hexo.config.future = true;
    hexo.locals.invalidate();
    cat.posts.map(mapper).should.eql(posts.map(mapper));
    cat.should.have.lengthOf(posts.length);

    // future off
    hexo.config.future = false;

    await Promise.all(posts.map(post => post.setCategories(['foo'])));
    hexo.locals.invalidate();
    cat = Category.findOne({name: 'foo'});
    cat.posts.eq(0)._id.should.eql(posts[0]._id);
    cat.posts.eq(1)._id.should.eql(posts[2]._id);
    cat.should.have.lengthOf(2);

    await cat.remove();
    await Promise.all(posts.map(post => post.remove()));

  });

  it('check whether a category exists', async () => {
    const data = await Category.insert({
      name: 'foo'
    });

    try {
      await Category.insert({
        name: 'foo'
      });
    } catch (err) {
      err.message.should.eql('Category `foo` has already existed!');
    }

    Category.removeById(data._id);
  });

  it('check whether a category exists (with parent)', async () => {
    let data = await Category.insert({
      name: 'foo'
    });
    data = await Category.insert({
      name: 'foo',
      parent: data._id
    });
    await Promise.all([
      Category.removeById(data._id),
      Category.removeById(data.parent)
    ]);
  });

  it('remove PostCategory references when a category is removed', async () => {
    const posts = await Post.insert([
      {source: 'foo.md', slug: 'foo'},
      {source: 'bar.md', slug: 'bar'},
      {source: 'baz.md', slug: 'baz'}
    ]);

    await Promise.all(posts.map(post => post.setCategories(['foo'])));

    const cat = Category.findOne({name: 'foo'});
    await Category.removeById(cat._id);

    PostCategory.find({category_id: cat._id}).should.have.lengthOf(0);

    await Promise.all(posts.map(post => post.remove()));
  });
});
