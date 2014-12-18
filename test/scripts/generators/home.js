var should = require('chai').should();
var Promise = require('bluebird');

describe('home', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname, {silent: true});
  var Post = hexo.model('Post');
  var generator = Promise.method(require('../../../lib/plugins/generator/home').bind(hexo));
  var posts;

  before(function(){
    return Post.insert([
      {source: 'foo', slug: 'foo', date: 1e8},
      {source: 'bar', slug: 'bar', date: 1e8 + 1},
      {source: 'baz', slug: 'baz', date: 1e8 - 1}
    ]).then(function(data){
      posts = data;
    });
  });

  it('pagination enabled', function(){
    hexo.config.per_page = 2;

    return generator(hexo.locals, function(path, layouts, locals){
      var arr = locals.posts.toArray();

      layouts.should.eql(['index', 'archive', 'index']);

      locals.base.should.eql('/');
      locals.total.should.eql(2);

      if (!path){ // Page 1
        path.should.eql('');
        arr[0]._id.should.eql(posts[1]._id);
        arr[1]._id.should.eql(posts[0]._id);

        locals.current.should.eql(1);
        locals.current_url.should.eql(path);
        locals.prev.should.eql(0);
        locals.prev_link.should.eql('');
        locals.next.should.eql(2);
        locals.next_link.should.eql(hexo.config.pagination_dir + '/2/');
      } else { // Page 2
        path.should.eql(hexo.config.pagination_dir + '/2/');
        arr[0]._id.should.eql(posts[2]._id);

        locals.current.should.eql(2);
        locals.current_url.should.eql(path);
        locals.prev.should.eql(1);
        locals.prev_link.should.eql('');
        locals.next.should.eql(0);
        locals.next_link.should.eql('');
      }
    });
  });

  it('pagination disabled', function(){
    hexo.config.per_page = 0;

    return generator(hexo.locals, function(path, layouts, locals){
      path.should.eql('');
      layouts.should.eql(['index', 'archive', 'index']);
      locals.posts.eq(0)._id.should.eql(posts[1]._id);
      locals.posts.eq(1)._id.should.eql(posts[0]._id);
      locals.posts.eq(2)._id.should.eql(posts[2]._id);
    });
  });
});