'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;

describe('Console list', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var Post = hexo.model('Post');

  var listPosts = require('../../../lib/plugins/console/list/post').bind(hexo);

  before(function() {
    var log = console.log;
    sinon.stub(console, 'log', function() {
      return log.apply(log, arguments);
    });
  });

  after(function() {
    console.log.restore();
  });

  it('no post', function() {
    listPosts();
    expect(console.log.calledWith(sinon.match('Date'))).to.be.true;
    expect(console.log.calledWith(sinon.match('Title'))).to.be.true;
    expect(console.log.calledWith(sinon.match('Path'))).to.be.true;
    expect(console.log.calledWith(sinon.match('Category'))).to.be.true;
    expect(console.log.calledWith(sinon.match('Tags'))).to.be.true;
    expect(console.log.calledWith(sinon.match('No posts.'))).to.be.true;
  });

  it('post', function() {
    var posts = [
      {source: 'foo', slug: 'foo', title: 'Its', date: 1e8},
      {source: 'bar', slug: 'bar', title: 'Math', date: 1e8 + 1},
      {source: 'baz', slug: 'baz', title: 'Dude', date: 1e8 - 1}
    ];
    return hexo.init()
    .then(function() {
      return Post.insert(posts);
    }).then(function() {
      hexo.locals.invalidate();
    })
    .then(function() {
      listPosts();
      expect(console.log.calledWith(sinon.match('Date'))).to.be.true;
      expect(console.log.calledWith(sinon.match('Title'))).to.be.true;
      expect(console.log.calledWith(sinon.match('Path'))).to.be.true;
      expect(console.log.calledWith(sinon.match('Category'))).to.be.true;
      expect(console.log.calledWith(sinon.match('Tags'))).to.be.true;
      for (var i = 0; i < posts.length; i++) {
        expect(console.log.calledWith(sinon.match(posts[i].source))).to.be.true;
        expect(console.log.calledWith(sinon.match(posts[i].slug))).to.be.true;
        expect(console.log.calledWith(sinon.match(posts[i].title))).to.be.true;
      }
    });
  });
});
