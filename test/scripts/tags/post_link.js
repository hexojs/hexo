'use strict';

var should = require('chai').should();

describe('post_link', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var postLink = require('../../../lib/plugins/tag/post_link')(hexo);
  var Post = hexo.model('Post');

  hexo.config.permalink = ':title/';

  before(function(){
    return hexo.init().then(function(){
      return Post.insert({
        source: 'foo',
        slug: 'foo',
        title: 'Hello world'
      });
    });
  });

  it('default', function(){
    postLink(['foo']).should.eql('<a href="/foo/" title="Hello world">Hello world</a>');
  });

  it('title', function(){
    postLink(['foo', 'test']).should.eql('<a href="/foo/" title="test">test</a>');
  });

  it('no slug', function(){
    should.not.exist(postLink([]));
  });

  it('post not found', function(){
    should.not.exist(postLink(['bar']));
  });
});