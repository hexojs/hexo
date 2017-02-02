'use strict';

var should = require('chai').should(); // eslint-disable-line
var sinon = require('sinon');
var pathFn = require('path');
var Promise = require('bluebird');

describe('Post', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var Post = hexo.model('Post');
  var Tag = hexo.model('Tag');
  var Category = hexo.model('Category');
  var PostTag = hexo.model('PostTag');
  var PostCategory = hexo.model('PostCategory');
  var Asset = hexo.model('Asset');

  before(function() {
    hexo.config.permalink = ':title';
    return hexo.init();
  });

  it('default values', function() {
    var now = Date.now();

    return Post.insert({
      source: 'foo.md',
      slug: 'bar'
    }).then(function(data) {
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

  it('source - required', function() {
    var errorCallback = sinon.spy(function(err) {
      err.should.have.property('message', '`source` is required!');
    });

    return Post.insert({}).catch(errorCallback).finally(function() {
      errorCallback.calledOnce.should.be.true;
    });
  });

  it('slug - required', function() {
    var errorCallback = sinon.spy(function(err) {
      err.should.have.property('message', '`slug` is required!');
    });

    return Post.insert({
      source: 'foo.md'
    }).catch(errorCallback).finally(function() {
      errorCallback.calledOnce.should.be.true;
    });
  });

  it('path - virtual', function() {
    return Post.insert({
      source: 'foo.md',
      slug: 'bar'
    }).then(function(data) {
      data.path.should.eql(data.slug);
      return Post.removeById(data._id);
    });
  });

  it('permalink - virtual', function() {
    hexo.config.root = '/';
    return Post.insert({
      source: 'foo.md',
      slug: 'bar'
    }).then(function(data) {
      data.permalink.should.eql(hexo.config.url + '/' + data.path);
      return Post.removeById(data._id);
    });
  });

  it('permalink_root_prefix - virtual', function() {
    hexo.config.url = 'http://yoursite.com/root';
    hexo.config.root = '/root/';
    return Post.insert({
      source: 'foo.md',
      slug: 'bar'
    }).then(function(data) {
      data.permalink.should.eql('http://yoursite.com/root/' + data.path);
      return Post.removeById(data._id);
    });
  });

  it('full_source - virtual', function() {
    return Post.insert({
      source: 'foo.md',
      slug: 'bar'
    }).then(function(data) {
      data.full_source.should.eql(pathFn.join(hexo.source_dir, data.source));
      return Post.removeById(data._id);
    });
  });

  it('asset_dir - virtual', function() {
    return Post.insert({
      source: 'foo.md',
      slug: 'bar'
    }).then(function(data) {
      data.asset_dir.should.eql(pathFn.join(hexo.source_dir, 'foo') + pathFn.sep);
      return Post.removeById(data._id);
    });
  });

  it('tags - virtual', function() {
    return Post.insert({
      source: 'foo.md',
      slug: 'bar'
    }).then(function(post) {
      return post.setTags(['foo', 'bar', 'baz'])
        .thenReturn(Post.findById(post._id));
    }).then(function(post) {
      post.tags.map(function(tag) {
        return tag.name;
      }).should.have.members(['bar', 'baz', 'foo']);

      return Post.removeById(post._id);
    });
  });

  it('categories - virtual', function() {
    return Post.insert({
      source: 'foo.md',
      slug: 'bar'
    }).then(function(post) {
      return post.setCategories(['foo', 'bar', 'baz'])
        .thenReturn(Post.findById(post._id));
    }).then(function(post) {
      var cats = post.categories;

      // Make sure the order of categories is correct
      cats.map(function(cat, i) {
        // Make sure the parent reference is correct
        if (i) {
          cat.parent.should.eql(cats.eq(i - 1)._id);
        } else {
          should.not.exist(cat.parent);
        }

        return cat.name;
      }).should.eql(['foo', 'bar', 'baz']);

      return Post.removeById(post._id);
    });
  });

  it('setTags() - old tags should be removed', function() {
    var id;

    return Post.insert({
      source: 'foo.md',
      slug: 'foo'
    }).then(function(post) {
      id = post._id;
      return post.setTags(['foo', 'bar']);
    }).then(function() {
      var post = Post.findById(id);
      return post.setTags(['bar', 'baz']);
    }).then(function() {
      var post = Post.findById(id);

      post.tags.map(function(tag) {
        return tag.name;
      }).should.eql(['bar', 'baz']);

      return Post.removeById(id);
    });
  });

  it('setTags() - sync problem', function() {
    return Post.insert([
      {source: 'foo.md', slug: 'foo'},
      {source: 'bar.md', slug: 'bar'}
    ]).then(function(posts) {
      return Promise.all([
        posts[0].setTags(['foo', 'bar']),
        posts[1].setTags(['bar', 'baz'])
      ]).thenReturn(posts);
    }).then(function(posts) {
      Tag.map(function(tag) {
        return tag.name;
      }).should.have.members(['foo', 'bar', 'baz']);

      return posts;
    }).map(function(post) {
      return Post.removeById(post._id);
    });
  });

  it('setTags() - empty tag', function() {
    var id;

    return Post.insert({
      source: 'foo.md',
      slug: 'foo'
    }).then(function(post) {
      id = post._id;
      return post.setTags(['', undefined, null, false, 0, 'normal']);
    }).then(function() {
      var post = Post.findById(id);

      post.tags.map(function(tag) {
        return tag.name;
      }).should.eql(['false', '0', 'normal']);
    }).finally(function() {
      return Post.removeById(id);
    });
  });

  it('setCategories() - old categories should be removed', function() {
    var id;

    return Post.insert({
      source: 'foo.md',
      slug: 'foo'
    }).then(function(post) {
      id = post._id;
      return post.setCategories(['foo', 'bar']);
    }).then(function() {
      var post = Post.findById(id);
      return post.setCategories(['foo', 'baz']);
    }).then(function() {
      var post = Post.findById(id);

      post.categories.map(function(cat) {
        return cat.name;
      }).should.eql(['foo', 'baz']);

      return Post.removeById(id);
    });
  });

  it('setCategories() - shared category should be same', function() {
    var postIdA, postIdB;

    return Post.insert({
      source: 'foo.md',
      slug: 'foo'
    }).then(function(post) {
      postIdA = post._id;
      return post.setCategories(['foo', 'bar']);
    }).then(function() {
      return Post.insert({
        source: 'bar.md',
        slug: 'bar'
      }).then(function(post) {
        postIdB = post._id;
        return post.setCategories(['foo', 'bar']);
      });
    }).then(function() {
      var postA = Post.findById(postIdA);
      var postB = Post.findById(postIdB);

      postA.categories.map(function(cat) {
        return cat._id;
      }).should.eql(postB.categories.map(function(cat) {
        return cat._id;
      }));

      return Promise.all([
        Post.removeById(postIdA),
        Post.removeById(postIdB)
      ]);
    });
  });

  it('setCategories() - category not shared should be different', function() {
    var postIdA, postIdB;

    return Post.insert({
      source: 'foo.md',
      slug: 'foo'
    }).then(function(post) {
      postIdA = post._id;
      return post.setCategories(['foo', 'bar']);
    }).then(function() {
      return Post.insert({
        source: 'bar.md',
        slug: 'bar'
      }).then(function(post) {
        postIdB = post._id;
        return post.setCategories(['baz', 'bar']);
      });
    }).then(function() {
      var postA = Post.findById(postIdA);
      var postB = Post.findById(postIdB);

      var postCategoriesA = postA.categories.map(function(cat) {
        return cat._id;
      });

      var postCategoriesB = postB.categories.map(function(cat) {
        return cat._id;
      });

      postCategoriesA.forEach(function(catId) {
        postCategoriesB.should.not.include(catId);
      });

      postCategoriesB.forEach(function(catId) {
        postCategoriesA.should.not.include(catId);
      });

      return Promise.all([
        Post.removeById(postIdA),
        Post.removeById(postIdB)
      ]);
    });
  });

  it('setCategories() - empty category', function() {
    var id;

    return Post.insert({
      source: 'foo.md',
      slug: 'foo'
    }).then(function(post) {
      id = post._id;
      return post.setCategories(['test', null]);
    }).then(function() {
      var post = Post.findById(id);

      post.categories.map(function(cat) {
        return cat.name;
      }).should.eql(['test']);
    }).finally(function() {
      return Post.removeById(id);
    });
  });

  it('setCategories() - empty category in middle', function() {
    var id;

    return Post.insert({
      source: 'foo.md',
      slug: 'foo'
    }).then(function(post) {
      id = post._id;
      return post.setCategories(['foo', null, 'bar']);
    }).then(function() {
      var post = Post.findById(id);

      post.categories.map(function(cat) {
        return cat.name;
      }).should.eql(['foo', 'bar']);
    }).finally(function() {
      return Post.removeById(id);
    });
  });

  it('remove PostTag references when a post is removed', function() {
    return Post.insert({
      source: 'foo.md',
      slug: 'bar'
    }).then(function(post) {
      return post.setTags(['foo', 'bar', 'baz'])
        .thenReturn(Post.findById(post._id));
    }).then(function(post) {
      return Post.removeById(post._id);
    }).then(function(post) {
      PostTag.find({post_id: post._id}).length.should.eql(0);
      Tag.findOne({name: 'foo'}).posts.length.should.eql(0);
      Tag.findOne({name: 'bar'}).posts.length.should.eql(0);
      Tag.findOne({name: 'baz'}).posts.length.should.eql(0);
    });
  });

  it('remove PostCategory references when a post is removed', function() {
    return Post.insert({
      source: 'foo.md',
      slug: 'bar'
    }).then(function(post) {
      return post.setCategories(['foo', 'bar', 'baz'])
        .thenReturn(Post.findById(post._id));
    }).then(function(post) {
      return Post.removeById(post._id);
    }).then(function(post) {
      PostCategory.find({post_id: post._id}).length.should.eql(0);
      Category.findOne({name: 'foo'}).posts.length.should.eql(0);
      Category.findOne({name: 'bar'}).posts.length.should.eql(0);
      Category.findOne({name: 'baz'}).posts.length.should.eql(0);
    });
  });

  it('remove related assets when a post is removed', function() {
    return Post.insert({
      source: 'foo.md',
      slug: 'bar'
    }).then(function(post) {
      return Promise.all([
        Asset.insert({_id: 'foo', path: 'foo'}),
        Asset.insert({_id: 'bar', path: 'bar'}),
        Asset.insert({_id: 'baz', path: 'bar'})
      ]).thenReturn(post);
    }).then(function(post) {
      return Post.removeById(post._id);
    }).then(function(post) {
      Asset.find({post: post._id}).length.should.eql(0);
    });
  });
});
