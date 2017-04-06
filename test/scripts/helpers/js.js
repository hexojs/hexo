var should = require('chai').should(); // eslint-disable-line

describe('js', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);

  var ctx = {
    config: hexo.config
  };

  ctx.url_for = require('../../../lib/plugins/helper/url_for').bind(ctx);

  var js = require('../../../lib/plugins/helper/js').bind(ctx);

  function assertResult(result) {
    var expected = '';

    for (var i = 1, len = arguments.length; i < len; i++) {
      expected += '<script src="' + arguments[i] + '"></script>\n';
    }

    result.should.eql(expected.trim());
  }

  it('a string', () => {
    assertResult(js('script'), '/script.js');
    assertResult(js('script.js'), '/script.js');
    assertResult(js('http://hexo.io/script.js'), 'http://hexo.io/script.js');
    assertResult(js('//hexo.io/script.js'), '//hexo.io/script.js');
  });

  it('an array', () => {
    assertResult(js(['foo', 'bar', 'baz']), '/foo.js', '/bar.js', '/baz.js');
  });

  it('multiple strings', () => {
    assertResult(js('foo', 'bar', 'baz'), '/foo.js', '/bar.js', '/baz.js');
  });

  it('multiple arrays', () => {
    assertResult(js(['foo', 'bar'], ['baz']), '/foo.js', '/bar.js', '/baz.js');
  });

  it('mixed', () => {
    assertResult(js(['foo', 'bar'], 'baz'), '/foo.js', '/bar.js', '/baz.js');
  });
});
