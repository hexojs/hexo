'use strict';

const sinon = require('sinon');
const pathFn = require('path');
const Promise = require('bluebird');
const { full_url_for } = require('hexo-util');

describe('Post', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  const Post = hexo.model('Post');
  const Tag = hexo.model('Tag');
  const Category = hexo.model('Category');
  const PostTag = hexo.model('PostTag');
  const PostCategory = hexo.model('PostCategory');
  const Asset = hexo.model('Asset');

  before(() => {
    hexo.config.permalink = ':title';
    return hexo.init();
  });

  it('default values', () => {
    const now = Date.now();

    return Post.insert({
      source: 'foo.md',
      slug: 'bar'
    }).then(data => {
      data.title.should.eql('');
      data.date.valueOf().should.gte(now);
      data.updated.valueOf().should.gte(now);
      data.comments.should.be.true;
      data.layout.should.eql('post');
      data._content.should.eql('');
      data.link.should.eql('');
      data.raw.should.eql('');
      data.published.should.be.true;
      should.not.exist(data.content);
      should.not.exist(data.excerpt);
      should.not.exist(data.more);

      return Post.removeById(data._id);
    });
  });

  it('source - required', () => {
    const errorCallback = sinon.spy(err => {
      err.should.have.property('message', '`source` is required!');
    });

    return Post.insert({}).catch(errorCallback).finally(() => {
      errorCallback.calledOnce.should.be.true;
    });
  });

  it('slug - required', () => {
    const errorCallback = sinon.spy(err => {
      err.should.have.property('message', '`slug` is required!');
    });

    return Post.insert({
      source: 'foo.md'
    }).catch(errorCallback).finally(() => {
      errorCallback.calledOnce.should.be.true;
    });
  });

  it('path - virtual', () => Post.insert({
    source: 'foo.md',
    slug: 'bar'
  }).then(data => {
    data.path.should.eql(data.slug);
    return Post.removeById(data._id);
  }));

  it('permalink - virtual', () => {
    hexo.config.root = '/';
    return Post.insert({
      source: 'foo.md',
      slug: 'bar'
    }).then(data => {
      data.permalink.should.eql(hexo.config.url + '/' + data.path);
      return Post.removeById(data._id);
    });
  });

  it('permalink - should be encoded', () => {
    const slug = 'bár';
    hexo.config.url = 'http://fôo.com';
    return Post.insert({
      source: 'foo.md',
      slug
    }).then(data => {
      data.permalink.should.eql(full_url_for.call(hexo, slug));
      hexo.config.url = 'http://yoursite.com';
      return Post.removeById(data._id);
    });
  });

  it('permalink - virtual - when set relative_link', () => {
    hexo.config.root = '/';
    hexo.config.relative_link = true;
    return Post.insert({
      source: 'foo.md',
      slug: 'bar'
    }).then(data => {
      data.permalink.should.eql(hexo.config.url + '/' + data.path);
      hexo.config.relative_link = false;
      return Post.removeById(data._id);
    });
  });

  it('permalink_root_prefix - virtual', () => {
    hexo.config.url = 'http://yoursite.com/root';
    hexo.config.root = '/root/';
    return Post.insert({
      source: 'foo.md',
      slug: 'bar'
    }).then(data => {
      data.permalink.should.eql('http://yoursite.com/root/' + data.path);
      return Post.removeById(data._id);
    });
  });

  it('permalink_root_prefix - virtual - when set relative_link', () => {
    hexo.config.url = 'http://yoursite.com/root';
    hexo.config.root = '/root/';
    hexo.config.relative_link = true;
    return Post.insert({
      source: 'foo.md',
      slug: 'bar'
    }).then(data => {
      data.permalink.should.eql(hexo.config.url + '/' + data.path);
      return Post.removeById(data._id);
    });
  });

  it('permalink - trailing_index', () => {
    hexo.config.pretty_urls.trailing_index = false;
    return Post.insert({
      source: 'foo.md',
      slug: 'bar/index.html'
    }).then(data => {
      data.permalink.should.eql(hexo.config.url + '/' + data.path.replace(/index\.html$/, ''));
      hexo.config.pretty_urls.trailing_index = true;
      return Post.removeById(data._id);
    });
  });

  it('permalink - trailing_html', () => {
    hexo.config.pretty_urls.trailing_html = false;
    return Post.insert({
      source: 'foo.md',
      slug: 'bar/foo.html'
    }).then(data => {
      data.permalink.should.eql(hexo.config.url + '/' + data.path.replace(/\.html$/, ''));
      hexo.config.pretty_urls.trailing_html = true;
      return Post.removeById(data._id);
    });
  });

  it('permalink - trailing_html - index.html', () => {
    hexo.config.pretty_urls.trailing_html = false;
    return Post.insert({
      source: 'foo.md',
      slug: 'bar/index.html'
    }).then(data => {
      data.permalink.should.eql(hexo.config.url + '/' + data.path);
      hexo.config.pretty_urls.trailing_html = true;
      return Post.removeById(data._id);
    });
  });

  it('full_source - virtual', () => Post.insert({
    source: 'foo.md',
    slug: 'bar'
  }).then(data => {
    data.full_source.should.eql(pathFn.join(hexo.source_dir, data.source));
    return Post.removeById(data._id);
  }));

  it('asset_dir - virtual', () => Post.insert({
    source: 'foo.md',
    slug: 'bar'
  }).then(data => {
    data.asset_dir.should.eql(pathFn.join(hexo.source_dir, 'foo') + pathFn.sep);
    return Post.removeById(data._id);
  }));

  it('tags - virtual', () => Post.insert({
    source: 'foo.md',
    slug: 'bar'
  }).then(post => post.setTags(['foo', 'bar', 'baz'])
    .thenReturn(Post.findById(post._id))).then(post => {
    post.tags.map(tag => tag.name).should.have.members(['bar', 'baz', 'foo']);

    return Post.removeById(post._id);
  }));

  it('categories - virtual', () => Post.insert({
    source: 'foo.md',
    slug: 'bar'
  }).then(post => post.setCategories(['foo', 'bar', 'baz'])
    .thenReturn(Post.findById(post._id))).then(post => {
    const cats = post.categories;

    // Make sure the order of categories is correct
    cats.map((cat, i) => {
      // Make sure the parent reference is correct
      if (i) {
        cat.parent.should.eql(cats.eq(i - 1)._id);
      } else {
        should.not.exist(cat.parent);
      }

      return cat.name;
    }).should.eql(['foo', 'bar', 'baz']);

    return Post.removeById(post._id);
  }));

  it('setTags() - old tags should be removed', () => {
    let id;

    return Post.insert({
      source: 'foo.md',
      slug: 'foo'
    }).then(post => {
      id = post._id;
      return post.setTags(['foo', 'bar']);
    }).then(() => {
      const post = Post.findById(id);
      return post.setTags(['bar', 'baz']);
    }).then(() => {
      const post = Post.findById(id);

      post.tags.map(tag => tag.name).should.eql(['bar', 'baz']);

      return Post.removeById(id);
    });
  });

  it('setTags() - sync problem', () => Post.insert([
    {source: 'foo.md', slug: 'foo'},
    {source: 'bar.md', slug: 'bar'}
  ]).then(posts => Promise.all([
    posts[0].setTags(['foo', 'bar']),
    posts[1].setTags(['bar', 'baz'])
  ]).thenReturn(posts)).then(posts => {
    Tag.map(tag => tag.name).should.have.members(['foo', 'bar', 'baz']);

    return posts;
  }).map(post => Post.removeById(post._id)));

  it('setTags() - empty tag', () => {
    let id;

    return Post.insert({
      source: 'foo.md',
      slug: 'foo'
    }).then(post => {
      id = post._id;
      return post.setTags(['', undefined, null, false, 0, 'normal']);
    }).then(() => {
      const post = Post.findById(id);

      post.tags.map(tag => tag.name).should.eql(['false', '0', 'normal']);
    }).finally(() => Post.removeById(id));
  });

  it('setCategories() - old categories should be removed', () => {
    let id;

    return Post.insert({
      source: 'foo.md',
      slug: 'foo'
    }).then(post => {
      id = post._id;
      return post.setCategories(['foo', 'bar']);
    }).then(() => {
      const post = Post.findById(id);
      return post.setCategories(['foo', 'baz']);
    }).then(() => {
      const post = Post.findById(id);

      post.categories.map(cat => cat.name).should.eql(['foo', 'baz']);

      return Post.removeById(id);
    });
  });

  it('setCategories() - shared category should be same', () => {
    let postIdA, postIdB;

    return Post.insert({
      source: 'foo.md',
      slug: 'foo'
    }).then(post => {
      postIdA = post._id;
      return post.setCategories(['foo', 'bar']);
    }).then(() => Post.insert({
      source: 'bar.md',
      slug: 'bar'
    }).then(post => {
      postIdB = post._id;
      return post.setCategories(['foo', 'bar']);
    })).then(() => {
      const postA = Post.findById(postIdA);
      const postB = Post.findById(postIdB);

      postA.categories.map(cat => cat._id).should.eql(postB.categories.map(cat => cat._id));

      return Promise.all([
        Post.removeById(postIdA),
        Post.removeById(postIdB)
      ]);
    });
  });

  it('setCategories() - category not shared should be different', () => {
    let postIdA, postIdB;

    return Post.insert({
      source: 'foo.md',
      slug: 'foo'
    }).then(post => {
      postIdA = post._id;
      return post.setCategories(['foo', 'bar']);
    }).then(() => Post.insert({
      source: 'bar.md',
      slug: 'bar'
    }).then(post => {
      postIdB = post._id;
      return post.setCategories(['baz', 'bar']);
    })).then(() => {
      const postA = Post.findById(postIdA);
      const postB = Post.findById(postIdB);

      const postCategoriesA = postA.categories.map(cat => cat._id);

      const postCategoriesB = postB.categories.map(cat => cat._id);

      postCategoriesA.forEach(catId => {
        postCategoriesB.should.not.include(catId);
      });

      postCategoriesB.forEach(catId => {
        postCategoriesA.should.not.include(catId);
      });

      return Promise.all([
        Post.removeById(postIdA),
        Post.removeById(postIdB)
      ]);
    });
  });

  it('setCategories() - empty category', () => {
    let id;

    return Post.insert({
      source: 'foo.md',
      slug: 'foo'
    }).then(post => {
      id = post._id;
      return post.setCategories(['test', null]);
    }).then(() => {
      const post = Post.findById(id);

      post.categories.map(cat => cat.name).should.eql(['test']);
    }).finally(() => Post.removeById(id));
  });

  it('setCategories() - empty category in middle', () => {
    let id;

    return Post.insert({
      source: 'foo.md',
      slug: 'foo'
    }).then(post => {
      id = post._id;
      return post.setCategories(['foo', null, 'bar']);
    }).then(() => {
      const post = Post.findById(id);

      post.categories.map(cat => cat.name).should.eql(['foo', 'bar']);
    }).finally(() => Post.removeById(id));
  });

  it('setCategories() - multiple hierarchies', () => Post.insert({
    source: 'foo.md',
    slug: 'bar'
  }).then(post => post.setCategories([['foo', '', 'bar'], '', 'baz'])
    .thenReturn(Post.findById(post._id))).then(post => {
    const cats = post.categories.toArray();

    // There should have been 3 categories set; blanks eliminated
    cats.should.have.lengthOf(3);

    // Category 1 should be foo, no parent
    cats[0].name.should.eql('foo');
    should.not.exist(cats[0].parent);

    // Category 2 should be bar, foo as parent
    cats[1].name.should.eql('bar');
    cats[1].parent.should.eql(cats[0]._id);

    // Category 3 should be baz, no parent
    cats[2].name.should.eql('baz');
    should.not.exist(cats[2].parent);

    return Post.removeById(post._id);
  }));

  it('setCategories() - multiple hierarchies (dedupes repeated parent)', () => Post.insert({
    source: 'foo.md',
    slug: 'bar'
  }).then(post => post.setCategories([['foo', 'bar'], ['foo', 'baz']])
    .thenReturn(Post.findById(post._id))).then(post => {
    const cats = post.categories.toArray();

    // There should have been 3 categories set (foo is dupe)
    cats.should.have.lengthOf(3);

    return Post.removeById(post._id);
  }));

  it('remove PostTag references when a post is removed', () => Post.insert({
    source: 'foo.md',
    slug: 'bar'
  }).then(post => post.setTags(['foo', 'bar', 'baz'])
    .thenReturn(Post.findById(post._id))).then(post => Post.removeById(post._id)).then(post => {
    PostTag.find({post_id: post._id}).length.should.eql(0);
    Tag.findOne({name: 'foo'}).posts.length.should.eql(0);
    Tag.findOne({name: 'bar'}).posts.length.should.eql(0);
    Tag.findOne({name: 'baz'}).posts.length.should.eql(0);
  }));

  it('remove PostCategory references when a post is removed', () => Post.insert({
    source: 'foo.md',
    slug: 'bar'
  }).then(post => post.setCategories(['foo', 'bar', 'baz'])
    .thenReturn(Post.findById(post._id))).then(post => Post.removeById(post._id)).then(post => {
    PostCategory.find({post_id: post._id}).length.should.eql(0);
    Category.findOne({name: 'foo'}).posts.length.should.eql(0);
    Category.findOne({name: 'bar'}).posts.length.should.eql(0);
    Category.findOne({name: 'baz'}).posts.length.should.eql(0);
  }));

  it('remove related assets when a post is removed', () => Post.insert({
    source: 'foo.md',
    slug: 'bar'
  }).then(post => Promise.all([
    Asset.insert({_id: 'foo', path: 'foo'}),
    Asset.insert({_id: 'bar', path: 'bar'}),
    Asset.insert({_id: 'baz', path: 'bar'})
  ]).thenReturn(post)).then(post => Post.removeById(post._id)).then(post => {
    Asset.find({post: post._id}).length.should.eql(0);
  }));
});
