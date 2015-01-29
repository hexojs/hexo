'use strict';

var should = require('chai').should();

describe('pullquote', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var pullquote = require('../../../lib/plugins/tag/pullquote')(hexo);

  before(function(){
    return hexo.init().then(function(){
      return hexo.loadPlugin(require.resolve('hexo-renderer-marked'));
    });
  });

  it('default', function(){
    var result = pullquote([], '123456 **bold** and *italic*');
    result.should.eql('<blockquote class="pullquote"><p>123456 <strong>bold</strong> and <em>italic</em></p>\n</blockquote>');
  });

  it('class', function(){
    var result = pullquote(['foo', 'bar'], '');
    result.should.eql('<blockquote class="pullquote foo bar"></blockquote>');
  });
});