var should = require('chai').should();
var Promise = require('bluebird');

describe('category', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname, {silent: true});
  var Post = hexo.model('Post');
  var Category = hexo.model('Category');
  var generator = Promise.method(require('../../../lib/plugins/generator/category').bind(hexo));
  var posts;

  function testNoPagination(){
    return generator(hexo.locals, function(path, layouts, locals){
      layouts.should.eql(['category', 'archive', 'index']);

      switch (path){
        case 'categories/foo/':
          locals.category.should.eql('foo');
          locals.posts.eq(0)._id.should.eql(posts[3]._id);
          locals.posts.eq(1)._id.should.eql(posts[0]._id);
          locals.posts.eq(2)._id.should.eql(posts[2]._id);
          break;

        case 'categories/bar/':
          locals.category.should.eql('bar');
          locals.posts.eq(0)._id.should.eql(posts[1]._id);
          break;

        default:
          throw new Error('Path "' + path + '" is not expected!');
      }
    });
  }

  before(function(){
    return Post.insert([
      {source: 'foo', slug: 'foo', date: 1e8},
      {source: 'bar', slug: 'bar', date: 1e8 + 1},
      {source: 'baz', slug: 'baz', date: 1e8 - 1},
      {source: 'boo', slug: 'boo', date: 1e8 + 2}
    ]).then(function(data){
      posts = data;

      return posts[0].setCategories(['foo']).then(function(){
        return posts[1].setCategories(['bar']);
      }).then(function(){
        return posts[2].setCategories(['foo']);
      }).then(function(){
        return posts[3].setCategories(['foo']);
      });
    });
  });

  it('mode: 0', function(){
    hexo.config.category = 0;

    return generator(hexo.locals).then(function(){
      should.not.exist(hexo.route.get('categories/foo/'));
      should.not.exist(hexo.route.get('categories/bar/'));
    });
  });

  it('mode: 1', function(){
    hexo.config.category = 1;

    return testNoPagination();
  });

  it('mode: 2 (per_page > 0)', function(){
    hexo.config.category = 2;
    hexo.config.per_page = 2;

    return generator(hexo.locals, function(path, layouts, locals){
      layouts.should.eql(['category', 'archive', 'index']);
      locals.current_url.should.eql(path);

      switch (path){
        case 'categories/foo/':
          locals.base.should.eql('/categories/foo/');
          locals.total.should.eql(2);
          locals.current.should.eql(1);
          locals.prev.should.eql(0);
          locals.prev_link.should.eql('');
          locals.next.should.eql(2);
          locals.next_link.should.eql('categories/foo/page/2/');
          locals.category.should.eql('foo');
          locals.posts.eq(0)._id.should.eql(posts[3]._id);
          locals.posts.eq(1)._id.should.eql(posts[0]._id);
          break;

        case 'categories/foo/page/2/':
          locals.base.should.eql('/categories/foo/');
          locals.total.should.eql(2);
          locals.current.should.eql(2);
          locals.prev.should.eql(1);
          locals.prev_link.should.eql('categories/foo/');
          locals.next.should.eql(0);
          locals.next_link.should.eql('');
          locals.category.should.eql('foo');
          locals.posts.eq(0)._id.should.eql(posts[2]._id);
          break;

        case 'categories/bar/':
          locals.base.should.eql('/categories/bar/');
          locals.total.should.eql(1);
          locals.current.should.eql(1);
          locals.prev.should.eql(0);
          locals.prev_link.should.eql('');
          locals.next.should.eql(0);
          locals.next_link.should.eql('');
          locals.category.should.eql('bar');
          locals.posts.eq(0)._id.should.eql(posts[1]._id);
          break;

        default:
          throw new Error('Path "' + path + '" is not expected!');
      }
    });
  });

  it('mode: 2 (per_page = 0)', function(){
    hexo.config.category = 2;
    hexo.config.per_page = 0;

    return testNoPagination();
  });

  it('ignore categories which has zero posts', function(){
    return Category.insert({
      name: 'empty'
    }).then(function(){
      return generator(hexo.locals, function(){});
    }).then(function(){
      should.not.exist(hexo.route.get('categories/empty/'));
    });
  });
});