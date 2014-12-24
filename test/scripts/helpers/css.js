var should = require('chai').should();

describe('css', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var urlHelper = require('../../../lib/plugins/helper/url');

  var ctx = {
    config: hexo.config
  };

  ctx.url_for = urlHelper.url_for.bind(ctx);

  var css = require('../../../lib/plugins/helper/css').bind(ctx);

  function assertResult(result){
    var expected = '';

    for (var i = 1, len = arguments.length; i < len; i++){
      expected += '<link rel="stylesheet" href="' + arguments[i] + '" type="text/css">\n';
    }

    result.should.eql(expected);
  }

  it('a string', function(){
    assertResult(css('style'), '/style.css');
    assertResult(css('style.css'), '/style.css');
    assertResult(css('http://hexo.io/style.css'), 'http://hexo.io/style.css');
    assertResult(css('//hexo.io/style.css'), '//hexo.io/style.css');
  });

  it('an array', function(){
    assertResult(css(['foo', 'bar', 'baz']), '/foo.css', '/bar.css', '/baz.css');
  });

  it('multiple strings', function(){
    assertResult(css('foo', 'bar', 'baz'), '/foo.css', '/bar.css', '/baz.css');
  });

  it('multiple arrays', function(){
    assertResult(css(['foo', 'bar'], ['baz']), '/foo.css', '/bar.css', '/baz.css');
  });

  it('mixed', function(){
    assertResult(css(['foo', 'bar'], 'baz'), '/foo.css', '/bar.css', '/baz.css');
  });
});