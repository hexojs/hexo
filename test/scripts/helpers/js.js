'use strict';

require('chai').should();

describe('js', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);

  const ctx = {
    config: hexo.config
  };

  ctx.url_for = require('../../../lib/plugins/helper/url_for').bind(ctx);

  const js = require('../../../lib/plugins/helper/js').bind(ctx);

  function assertResult(result) {
    let expected = '';

    for (let i = 1, len = arguments.length; i < len; i++) {
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
