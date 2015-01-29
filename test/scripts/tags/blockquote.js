'use strict';

var should = require('chai').should();

describe('blockquote', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var blockquote = require('../../../lib/plugins/tag/blockquote')(hexo);

  before(function(){
    return hexo.init().then(function(){
      return hexo.loadPlugin(require.resolve('hexo-renderer-marked'));
    });
  });

  var bq = function(args, content){
    return blockquote(args.split(' '), content || '');
  };

  it('default', function(){
    var result = bq('', '123456 **bold** and *italic*');
    result.should.eql('<blockquote><p>123456 <strong>bold</strong> and <em>italic</em></p>\n</blockquote>');
  });

  it('author', function(){
    var result = bq('John Doe', '');
    result.should.eql('<blockquote><footer><strong>John Doe</strong></footer></blockquote>');
  });

  it('source', function(){
    var result = bq('Jane Austen, Pride and Prejudice');
    result.should.eql('<blockquote><footer><strong>Jane Austen</strong><cite>Pride and Prejudice</cite></footer></blockquote>');
  });

  it('link', function(){
    var result = bq('John Doe http://hexo.io/');
    result.should.eql('<blockquote><footer><strong>John Doe</strong><cite><a href="http://hexo.io/">hexo.io</a></cite></footer></blockquote>');
  });

  it('link title', function(){
    var result = bq('John Doe http://hexo.io/ Hexo');
    result.should.eql('<blockquote><footer><strong>John Doe</strong><cite><a href="http://hexo.io/">Hexo</a></cite></footer></blockquote>');
  });

  it('titlecase', function(){
    hexo.config.titlecase = true;

    var result = bq('Jane Austen, pride and prejudice');
    result.should.eql('<blockquote><footer><strong>Jane Austen</strong><cite>Pride and Prejudice</cite></footer></blockquote>');

    hexo.config.titlecase = false;
  });
});