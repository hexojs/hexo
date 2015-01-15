var should = require('chai').should();
var Promise = require('bluebird');

describe('Category', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var Category = hexo.model('Category');
  var Post = hexo.model('Post');
  var PostCategory = hexo.model('PostCategory');

  before(function(){
    return hexo.init();
  });

  it('name - required', function(){
    return Category.insert({}).catch(function(err){
      err.should.have.property('message', '`name` is required!');
    });
  });

  it.skip('parent - reference');

  it('slug - virtual', function(){
    return Category.insert({
      name: 'foo'
    }).then(function(data){
      data.slug.should.eql('foo');
      return Category.removeById(data._id);
    });
  });

  it('slug - category_map', function(){
    hexo.config.category_map = {
      test: 'wat'
    };

    return Category.insert({
      name: 'test'
    }).then(function(data){
      data.slug.should.eql('wat');
      hexo.config.category_map = {};
      return Category.removeById(data._id);
    });
  });

  it('slug - filename_case: 0', function(){
    return Category.insert({
      name: 'WahAHa'
    }).then(function(data){
      data.slug.should.eql('WahAHa');
      return Category.removeById(data._id);
    });
  });

  it('slug - filename_case: 1', function(){
    hexo.config.filename_case = 1;

    return Category.insert({
      name: 'WahAHa'
    }).then(function(data){
      data.slug.should.eql('wahaha');
      hexo.config.filename_case = 0;
      return Category.removeById(data._id);
    });
  });

  it('slug - filename_case: 2', function(){
    hexo.config.filename_case = 2;

    return Category.insert({
      name: 'WahAHa'
    }).then(function(data){
      data.slug.should.eql('WAHAHA');
      hexo.config.filename_case = 0;
      return Category.removeById(data._id);
    });
  });

  it('slug - parent', function(){
    return Category.insert({
      name: 'parent'
    }).then(function(cat){
      return Category.insert({
        name: 'child',
        parent: cat._id
      });
    }).then(function(cat){
      cat.slug.should.eql('parent/child');

      return Promise.all([
        Category.removeById(cat._id),
        Category.removeById(cat.parent)
      ]);
    });
  });

  it('path - virtual', function(){
    return Category.insert({
      name: 'foo'
    }).then(function(data){
      data.path.should.eql(hexo.config.category_dir + '/' + data.slug + '/');
      return Category.removeById(data._id);
    });
  });

  it('permalink - virtual', function(){
    return Category.insert({
      name: 'foo'
    }).then(function(data){
      data.permalink.should.eql(hexo.config.url + '/' + data.path);
      return Category.removeById(data._id);
    });
  });

  it('posts - virtual', function(){
    return Post.insert([
      {source: 'foo.md', slug: 'foo'},
      {source: 'bar.md', slug: 'bar'},
      {source: 'baz.md', slug: 'baz'}
    ]).each(function(post){
      return post.setCategories(['foo']);
    }).then(function(posts){
      var cat = Category.findOne({name: 'foo'});

      function mapper(post){
        return post._id;
      }

      cat.posts.map(mapper).should.eql(posts.map(mapper));
      cat.length.should.eql(posts.length);

      return cat.remove().thenReturn(posts);
    }).map(function(post){
      return post.remove();
    });
  });

  it('posts - draft', function(){
    return Post.insert([
      {source: 'foo.md', slug: 'foo', published: true},
      {source: 'bar.md', slug: 'bar', published: false},
      {source: 'baz.md', slug: 'baz', published: true}
    ]).each(function(post){
      return post.setCategories(['foo']);
    }).then(function(posts){
      var cat = Category.findOne({name: 'foo'});

      function mapper(post){
        return post._id;
      }

      // draft off
      cat.posts.eq(0)._id.should.eql(posts[0]._id);
      cat.posts.eq(1)._id.should.eql(posts[2]._id);
      cat.length.should.eql(2);

      // draft on
      hexo.config.render_drafts = true;
      cat = Category.findOne({name: 'foo'});
      cat.posts.map(mapper).should.eql(posts.map(mapper));
      cat.length.should.eql(posts.length);
      hexo.config.render_drafts = false;

      return cat.remove().thenReturn(posts);
    }).map(function(post){
      return post.remove();
    });
  });

  it('posts - future', function(){
    var now = Date.now();

    return Post.insert([
      {source: 'foo.md', slug: 'foo', date: now - 3600},
      {source: 'bar.md', slug: 'bar', date: now + 3600},
      {source: 'baz.md', slug: 'baz', date: now}
    ]).each(function(post){
      return post.setCategories(['foo']);
    }).then(function(posts){
      var cat = Category.findOne({name: 'foo'});

      function mapper(post){
        return post._id;
      }

      // future on
      hexo.config.future = true;
      cat.posts.map(mapper).should.eql(posts.map(mapper));
      cat.length.should.eql(posts.length);

      // future off
      hexo.config.future = false;
      cat = Category.findOne({name: 'foo'});
      cat.posts.eq(0)._id.should.eql(posts[0]._id);
      cat.posts.eq(1)._id.should.eql(posts[2]._id);
      cat.length.should.eql(2);

      return cat.remove().thenReturn(posts);
    }).map(function(post){
      return post.remove();
    });
  });

  it('check whether a category exists', function(){
    return Category.insert({
      name: 'foo'
    }).then(function(data){
      Category.insert({
        name: 'foo'
      }).catch(function(err){
        err.should.have.property('message', 'Category `foo` has already existed!');
      });

      return Category.removeById(data._id);
    });
  });

  it('check whether a category exists (with parent)', function(){
    return Category.insert({
      name: 'foo'
    }).then(function(data){
      return Category.insert({
        name: 'foo',
        parent: data._id
      });
    }).then(function(data){
      return Promise.all([
        Category.removeById(data._id),
        Category.removeById(data.parent)
      ]);
    });
  });

  it('remove PostCategory references when a category is removed', function(){
    var cat;

    return Post.insert([
      {source: 'foo.md', slug: 'foo'},
      {source: 'bar.md', slug: 'bar'},
      {source: 'baz.md', slug: 'baz'}
    ]).then(function(posts){
      return Promise.map(posts, function(post){
        return post.setCategories(['foo']).thenReturn(post);
      }, {concurrency: 1}); // One item a time
    }).then(function(posts){
      cat = Category.findOne({name: 'foo'});
      return Category.removeById(cat._id).thenReturn(posts);
    }).then(function(posts){
      PostCategory.find({category_id: cat._id}).length.should.eql(0);
      return posts;
    }).map(function(post){
      return Post.removeById(post._id);
    });
  });
});