var should = require('chai').should(); // eslint-disable-line

describe('css', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);

  var ctx = {
    config: hexo.config
  };

  ctx.url_for = require('../../../lib/plugins/helper/url_for').bind(ctx);

  var css = require('../../../lib/plugins/helper/css').bind(ctx);

  function assertResult(result) {
    var expected = '';

    for (var i = 1, len = arguments.length; i < len; i++) {
      expected += '<link rel="stylesheet" href="' + arguments[i] + '">\n';
    }

    result.should.eql(expected.trim());
  }

  it('a string', () => {
    assertResult(css('style'), '/style.css');
    assertResult(css('style.css'), '/style.css');
    assertResult(css('http://hexo.io/style.css'), 'http://hexo.io/style.css');
    assertResult(css('//hexo.io/style.css'), '//hexo.io/style.css');
  });

  it('an array', () => {
    assertResult(css(['foo', 'bar', 'baz']), '/foo.css', '/bar.css', '/baz.css');
  });

  it('multiple strings', () => {
    assertResult(css('foo', 'bar', 'baz'), '/foo.css', '/bar.css', '/baz.css');
  });

  it('multiple arrays', () => {
    assertResult(css(['foo', 'bar'], ['baz']), '/foo.css', '/bar.css', '/baz.css');
  });

  it('mixed', () => {
    assertResult(css(['foo', 'bar'], 'baz'), '/foo.css', '/bar.css', '/baz.css');
  });
});
