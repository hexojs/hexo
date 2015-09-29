'use strict';

var should = require('chai').should(); // eslint-disable-line

describe('post_path', function() {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var postPath = require('../../../lib/plugins/tag/post_path')(hexo);
  var Post = hexo.model('Post');

  hexo.config.permalink = ':title/';

  before(function() {
    return hexo.init().then(function() {
      return Post.insert({
        source: 'foo',
        slug: 'foo'
      });
    });
  });

  it('default', function() {
    postPath(['foo']).should.eql('/foo/');
  });

  it('no slug', function() {
    should.not.exist(postPath([]));
  });

  it('post not found', function() {
    should.not.exist(postPath(['bar']));
  });
});
