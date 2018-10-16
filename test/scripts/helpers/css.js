require('chai').should(); // eslint-disable-line strict

describe('css', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);

  const ctx = {
    config: hexo.config
  };

  ctx.url_for = require('../../../lib/plugins/helper/url_for').bind(ctx);

  const css = require('../../../lib/plugins/helper/css').bind(ctx);

  function assertResult(result) {
    let expected = '';

    for (let i = 1, len = arguments.length; i < len; i++) {
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
