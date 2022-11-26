'use strict';

const cheerio = require('cheerio');

describe('css', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);

  const ctx = {
    config: hexo.config
  };

  const css = require('../../../lib/plugins/helper/css').bind(ctx);

  function assertResult(result, expected) {
    const $ = cheerio.load(result);

    if (!Array.isArray(expected)) {
      expected = [expected];
    }

    expected.forEach((item, index) => {
      if (typeof item === 'string' || item instanceof String) {
        $('link').eq(index).attr('href').should.eql(item);
      } else {
        for (const attribute in item) {
          $('link').eq(index).attr(attribute).should.eql(item[attribute]);
        }
      }
    });
  }

  it('a string', () => {
    assertResult(css('style'), '/style.css');
    assertResult(css('style.css'), '/style.css');
    assertResult(css('https://hexo.io/style.css'), 'https://hexo.io/style.css');
    assertResult(css('//hexo.io/style.css'), '//hexo.io/style.css');
  });

  it('an array', () => {
    assertResult(css(['//hexo.io/style.css']), '//hexo.io/style.css');

    assertResult(css(['foo', 'bar', 'baz']), ['/foo.css', '/bar.css', '/baz.css']);
  });

  it('multiple strings', () => {
    assertResult(css('foo', 'bar', 'baz'), ['/foo.css', '/bar.css', '/baz.css']);
  });

  it('multiple arrays', () => {
    assertResult(css(['foo', 'bar'], ['baz']), ['/foo.css', '/bar.css', '/baz.css']);
  });

  it('mixed', () => {
    assertResult(css(['foo', 'bar'], 'baz'), ['/foo.css', '/bar.css', '/baz.css']);
  });

  it('an object', () => {
    assertResult(css({href: 'script.css'}), {href: '/script.css'});
    assertResult(css({href: '/script.css'}), {href: '/script.css'});
    assertResult(css({href: 'script'}), {href: '/script.css'});
    assertResult(css({href: '/script.css', foo: 'bar'}), {href: '/script.css', foo: 'bar'});
  });

  it('mulitple objects', () => {
    assertResult(css({href: '/foo.css'}, {href: '/bar.css'}), [{href: '/foo.css'}, {href: '/bar.css'}]);
    assertResult(css({href: '/aaa.css', bbb: 'ccc'}, {href: '/ddd.css', eee: 'fff'}),
      [{href: '/aaa.css', bbb: 'ccc'}, {href: '/ddd.css', eee: 'fff'}]);
  });

  it('an array of objects', () => {
    assertResult(css([{href: '/foo.css'}, {href: '/bar.css'}]), [{href: '/foo.css'}, {href: '/bar.css'}]);
    assertResult(css([{href: '/aaa.css', bbb: 'ccc'}, {href: '/ddd.css', eee: 'fff'}]),
      [{href: '/aaa.css', bbb: 'ccc'}, {href: '/ddd.css', eee: 'fff'}]);
  });
});
