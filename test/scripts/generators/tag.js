var should = require('chai').should();
var Promise = require('bluebird');

describe('tag', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname, {silent: true});
  var Post = hexo.model('Post');
  var Tag = hexo.model('Tag');
  var generator = Promise.method(require('../../../lib/plugins/generator/tag').bind(hexo));
  var posts;

  function testNoPagination(){
    return generator(hexo.locals, function(path, layouts, locals){
      layouts.should.eql(['tag', 'archive', 'index']);

      switch (path){
        case 'tags/foo/':
          locals.tag.should.eql('foo');
          locals.posts.eq(0)._id.should.eql(posts[3]._id);
          locals.posts.eq(1)._id.should.eql(posts[0]._id);
          locals.posts.eq(2)._id.should.eql(posts[2]._id);
          break;

        case 'tags/bar/':
          locals.tag.should.eql('bar');
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

      // TODO: Warehouse needs to add a mutex lock when writing data to avoid data sync problem
      return posts[0].setTags(['foo']).then(function(){
        return posts[1].setTags(['bar']);
      }).then(function(){
        return posts[2].setTags(['foo']);
      }).then(function(){
        return posts[3].setTags(['foo']);
      });
    });
  });

  it('mode: 0', function(){
    hexo.config.tag = 0;

    return generator(hexo.locals).then(function(){
      should.not.exist(hexo.route.get('tags/foo/'));
      should.not.exist(hexo.route.get('tags/bar/'));
    });
  });

  it('mode: 1', function(){
    hexo.config.tag = 1;

    return testNoPagination();
  });

  it('mode: 2 (per_page > 0)', function(){
    hexo.config.tag = 2;
    hexo.config.per_page = 2;

    return generator(hexo.locals, function(path, layouts, locals){
      layouts.should.eql(['tag', 'archive', 'index']);
      locals.current_url.should.eql(path);

      switch (path){
        case 'tags/foo/':
          locals.base.should.eql('/tags/foo/');
          locals.total.should.eql(2);
          locals.current.should.eql(1);
          locals.prev.should.eql(0);
          locals.prev_link.should.eql('');
          locals.next.should.eql(2);
          locals.next_link.should.eql('tags/foo/page/2/');
          locals.tag.should.eql('foo');
          locals.posts.eq(0)._id.should.eql(posts[3]._id);
          locals.posts.eq(1)._id.should.eql(posts[0]._id);
          break;

        case 'tags/foo/page/2/':
          locals.base.should.eql('/tags/foo/');
          locals.total.should.eql(2);
          locals.current.should.eql(2);
          locals.prev.should.eql(1);
          locals.prev_link.should.eql('tags/foo/');
          locals.next.should.eql(0);
          locals.next_link.should.eql('');
          locals.tag.should.eql('foo');
          locals.posts.eq(0)._id.should.eql(posts[2]._id);
          break;

        case 'tags/bar/':
          locals.base.should.eql('/tags/bar/');
          locals.total.should.eql(1);
          locals.current.should.eql(1);
          locals.prev.should.eql(0);
          locals.prev_link.should.eql('');
          locals.next.should.eql(0);
          locals.next_link.should.eql('');
          locals.tag.should.eql('bar');
          locals.posts.eq(0)._id.should.eql(posts[1]._id);
          break;

        default:
          throw new Error('Path "' + path + '" is not expected!');
      }
    });
  });

  it('mode: 2 (per_page = 0)', function(){
    hexo.config.tag = 2;
    hexo.config.per_page = 0;

    return testNoPagination();
  });

  it('ignore tags which has zero posts', function(){
    return Tag.insert({
      name: 'empty'
    }).then(function(){
      return generator(hexo.locals, function(){});
    }).then(function(){
      should.not.exist(hexo.route.get('tags/empty/'));
    });
  });
});