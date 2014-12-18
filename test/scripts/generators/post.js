var should = require('chai').should();
var Promise = require('bluebird');

describe('post', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname, {silent: true});
  var Post = hexo.model('Post');
  var generator = Promise.method(require('../../../lib/plugins/generator/post').bind(hexo));

  it('default layout', function(){
    return Post.insert({
      source: 'foo',
      slug: 'bar'
    }).then(function(post){
      return generator(hexo.locals, function(path, layouts, locals){
        path.should.eql(post.path);
        layouts.should.eql(['post', 'page', 'index']);
        locals._id.should.eql(post._id);
      }).then(function(){
        return post.remove();
      });
    });
  });

  it('custom layout', function(){
    return Post.insert({
      source: 'foo',
      slug: 'bar',
      layout: 'photo'
    }).then(function(post){
      return generator(hexo.locals, function(path, layouts, locals){
        layouts.should.eql(['photo', 'post', 'page', 'index']);
      }).then(function(){
        return post.remove();
      });
    });
  });

  it('layout disabled', function(){
    return Post.insert({
      source: 'foo',
      slug: 'bar',
      layout: false
    }).then(function(post){
      return generator(hexo.locals).then(function(){
        var route = hexo.route.get(post.path);

        route(function(err, result){
          should.not.exist(err);
          result.should.eql(post.content);
        });

        return post.remove();
      });
    });
  });

  it('prev/next post', function(){
    return Promise.all([
      Post.insert({source: 'foo', slug: 'foo', date: 1e8}),
      Post.insert({source: 'bar', slug: 'bar', date: 1e8 + 1}),
      Post.insert({source: 'baz', slug: 'baz', date: 1e8 - 1})
    ]).then(function(posts){
      return generator(hexo.locals, function(path, layouts, locals){
        switch (locals._id){
          case posts[0]._id:
            locals.prev._id.should.eql(posts[1]._id);
            locals.next._id.should.eql(posts[2]._id);
            break;

          case posts[1]._id:
            should.not.exist(locals.prev);
            locals.next._id.should.eql(posts[0]._id);
            break;

          case posts[2]._id:
            locals.prev._id.should.eql(posts[0]._id);
            should.not.exist(locals.next);
            break;
        }
      }).thenReturn(posts);
    }).map(function(post){
      return post.remove();
    });
  });
});