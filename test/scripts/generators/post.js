'use strict';

var should = require('chai').should(); // eslint-disable-line
var Promise = require('bluebird');

describe('post', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname, {silent: true});
  var Post = hexo.model('Post');
  var generator = Promise.method(require('../../../lib/plugins/generator/post').bind(hexo));

  hexo.config.permalink = ':title/';

  function locals() {
    hexo.locals.invalidate();
    return hexo.locals.toObject();
  }

  before(function() {
    return hexo.init();
  });

  it('default layout', function() {
    return Post.insert({
      source: 'foo',
      slug: 'bar'
    }).then(function(post) {
      return generator(locals()).then(function(data) {
        post.__post = true;

        data.should.eql([
          {
            path: 'bar/',
            layout: ['post', 'page', 'index'],
            data: post
          }
        ]);

        return post.remove();
      });
    });
  });

  it('custom layout', function() {
    return Post.insert({
      source: 'foo',
      slug: 'bar',
      layout: 'photo'
    }).then(function(post) {
      return generator(locals()).then(function(data) {
        data[0].layout.should.eql(['photo', 'post', 'page', 'index']);

        return post.remove();
      });
    });
  });

  it('layout disabled', function() {
    return Post.insert({
      source: 'foo',
      slug: 'bar',
      layout: false
    }).then(function(post) {
      return generator(locals()).then(function(data) {
        should.not.exist(data[0].layout);

        return post.remove();
      });
    });
  });

  it('prev/next post', function() {
    return Post.insert([
      {source: 'foo', slug: 'foo', date: 1e8},
      {source: 'bar', slug: 'bar', date: 1e8 + 1},
      {source: 'baz', slug: 'baz', date: 1e8 - 1}
    ]).then(function(posts) {
      return generator(locals()).then(function(data) {
        should.not.exist(data[0].data.prev);
        data[0].data.next._id.should.eql(posts[0]._id);

        data[1].data.prev._id.should.eql(posts[1]._id);
        data[1].data.next._id.should.eql(posts[2]._id);

        data[2].data.prev._id.should.eql(posts[0]._id);
        should.not.exist(data[2].data.next);
      }).thenReturn(posts);
    }).map(function(post) {
      return post.remove();
    });
  });
});
