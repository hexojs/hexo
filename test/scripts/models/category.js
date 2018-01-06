var should = require('chai').should(); // eslint-disable-line
var sinon = require('sinon');
var Promise = require('bluebird');

describe('Category', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var Category = hexo.model('Category');
  var Post = hexo.model('Post');
  var PostCategory = hexo.model('PostCategory');

  before(() => hexo.init());

  it('name - required', () => {
    var errorCallback = sinon.spy(err => {
      err.should.have.property('message', '`name` is required!');
    });

    return Category.insert({}).catch(errorCallback).finally(() => {
      errorCallback.calledOnce.should.be.true;
    });
  });

  it.skip('parent - reference');

  it('slug - virtual', () => Category.insert({
    name: 'foo'
  }).then(data => {
    data.slug.should.eql('foo');
    return Category.removeById(data._id);
  }));

  it('slug - category_map', () => {
    hexo.config.category_map = {
      test: 'wat'
    };

    return Category.insert({
      name: 'test'
    }).then(data => {
      data.slug.should.eql('wat');
      hexo.config.category_map = {};
      return Category.removeById(data._id);
    });
  });

  it('slug - filename_case: 0', () => Category.insert({
    name: 'WahAHa'
  }).then(data => {
    data.slug.should.eql('WahAHa');
    return Category.removeById(data._id);
  }));

  it('slug - filename_case: 1', () => {
    hexo.config.filename_case = 1;

    return Category.insert({
      name: 'WahAHa'
    }).then(data => {
      data.slug.should.eql('wahaha');
      hexo.config.filename_case = 0;
      return Category.removeById(data._id);
    });
  });

  it('slug - filename_case: 2', () => {
    hexo.config.filename_case = 2;

    return Category.insert({
      name: 'WahAHa'
    }).then(data => {
      data.slug.should.eql('WAHAHA');
      hexo.config.filename_case = 0;
      return Category.removeById(data._id);
    });
  });

  it('slug - parent', () => Category.insert({
    name: 'parent'
  }).then(cat => Category.insert({
    name: 'child',
    parent: cat._id
  })).then(cat => {
    cat.slug.should.eql('parent/child');

    return Promise.all([
      Category.removeById(cat._id),
      Category.removeById(cat.parent)
    ]);
  }));

  it('path - virtual', () => Category.insert({
    name: 'foo'
  }).then(data => {
    data.path.should.eql(hexo.config.category_dir + '/' + data.slug + '/');
    return Category.removeById(data._id);
  }));

  it('permalink - virtual', () => Category.insert({
    name: 'foo'
  }).then(data => {
    data.permalink.should.eql(hexo.config.url + '/' + data.path);
    return Category.removeById(data._id);
  }));

  it('posts - virtual', () => Post.insert([
    {source: 'foo.md', slug: 'foo'},
    {source: 'bar.md', slug: 'bar'},
    {source: 'baz.md', slug: 'baz'}
  ]).each(post => post.setCategories(['foo'])).then(posts => {
    var cat = Category.findOne({name: 'foo'});

    function mapper(post) {
      return post._id;
    }

    hexo.locals.invalidate();
    cat.posts.map(mapper).should.eql(posts.map(mapper));
    cat.length.should.eql(posts.length);

    return cat.remove().thenReturn(posts);
  }).map(post => post.remove()));

  it('posts - draft', () => Post.insert([
    {source: 'foo.md', slug: 'foo', published: true},
    {source: 'bar.md', slug: 'bar', published: false},
    {source: 'baz.md', slug: 'baz', published: true}
  ]).each(post => post.setCategories(['foo'])).then(posts => {
    var cat = Category.findOne({name: 'foo'});

    function mapper(post) {
      return post._id;
    }

    // draft off
    hexo.locals.invalidate();
    cat.posts.eq(0)._id.should.eql(posts[0]._id);
    cat.posts.eq(1)._id.should.eql(posts[2]._id);
    cat.length.should.eql(2);

    // draft on
    hexo.config.render_drafts = true;
    hexo.locals.invalidate();
    cat = Category.findOne({name: 'foo'});
    cat.posts.map(mapper).should.eql(posts.map(mapper));
    cat.length.should.eql(posts.length);
    hexo.config.render_drafts = false;

    return cat.remove().thenReturn(posts);
  }).map(post => post.remove()));

  it('posts - future', () => {
    var now = Date.now();

    return Post.insert([
      {source: 'foo.md', slug: 'foo', date: now - 3600},
      {source: 'bar.md', slug: 'bar', date: now + 3600},
      {source: 'baz.md', slug: 'baz', date: now}
    ]).each(post => post.setCategories(['foo'])).then(posts => {
      var cat = Category.findOne({name: 'foo'});

      function mapper(post) {
        return post._id;
      }

      // future on
      hexo.config.future = true;
      hexo.locals.invalidate();
      cat.posts.map(mapper).should.eql(posts.map(mapper));
      cat.length.should.eql(posts.length);

      // future off
      hexo.config.future = false;
      hexo.locals.invalidate();
      cat = Category.findOne({name: 'foo'});
      cat.posts.eq(0)._id.should.eql(posts[0]._id);
      cat.posts.eq(1)._id.should.eql(posts[2]._id);
      cat.length.should.eql(2);

      return cat.remove().thenReturn(posts);
    }).map(post => post.remove());
  });

  it('check whether a category exists', () => {
    var errorCallback = sinon.spy(err => {
      err.should.have.property('message', 'Category `foo` has already existed!');
    });

    return Category.insert({
      name: 'foo'
    }).then(data => {
      Category.insert({
        name: 'foo'
      }).catch(errorCallback);

      return Category.removeById(data._id);
    }).finally(() => {
      errorCallback.calledOnce.should.be.true;
    });
  });

  it('check whether a category exists (with parent)', () => Category.insert({
    name: 'foo'
  }).then(data => Category.insert({
    name: 'foo',
    parent: data._id
  })).then(data => Promise.all([
    Category.removeById(data._id),
    Category.removeById(data.parent)
  ])));

  it('remove PostCategory references when a category is removed', () => {
    var cat;

    return Post.insert([
      {source: 'foo.md', slug: 'foo'},
      {source: 'bar.md', slug: 'bar'},
      {source: 'baz.md', slug: 'baz'}
    ]).then(posts => // One item a time
      Promise.map(
        posts,
        post => post.setCategories(['foo']).thenReturn(post),
        {concurrency: 1}
      )).then(posts => {
      cat = Category.findOne({name: 'foo'});
      return Category.removeById(cat._id).thenReturn(posts);
    }).then(posts => {
      PostCategory.find({category_id: cat._id}).length.should.eql(0);
      return posts;
    }).map(post => Post.removeById(post._id));
  });
});
