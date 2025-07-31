import { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import Hexo from '../../../lib/hexo';
import cssHelper from '../../../lib/plugins/helper/css';
type CssHelperParams = Parameters<typeof cssHelper>;
type CssHelperReturn = ReturnType<typeof cssHelper>;

// Cross-compatible __dirname for ESM and CJS, without require
let __hexo_dirname: string;
if (typeof __dirname !== 'undefined') {
  // CJS
  __hexo_dirname = __dirname;
} else {
  // ESM (only works in ESM context)
  let url = '';
  try {
    // @ts-ignore: import.meta.url is only available in ESM, safe to ignore in CJS
    url = import.meta.url;
  } catch {}
  __hexo_dirname = url ? dirname(fileURLToPath(url)) : '';
}

describe('css', () => {
  const hexo = new Hexo(__hexo_dirname);

  const ctx: any = {
    config: hexo.config
  };

  const css: (...args: CssHelperParams) => CssHelperReturn = cssHelper.bind(ctx);

  function assertResult(result, expected) {
    const $ = cheerio.load(result);

    if (!Array.isArray(expected)) {
      expected = [expected];
    }

    expected.forEach((item, index) => {
      if (typeof item === 'string' || item instanceof String) {
        $('link').eq(index).attr('href')!.should.eql(item);
      } else {
        for (const attribute in item) {
          $('link').eq(index).attr(attribute)!.should.eql(item[attribute]);
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

  it('multiple objects', () => {
    assertResult(css({href: '/foo.css'}, {href: '/bar.css'}), [{href: '/foo.css'}, {href: '/bar.css'}]);
    assertResult(css({href: '/aaa.css', bbb: 'ccc'}, {href: '/ddd.css', eee: 'fff'}),
      [{href: '/aaa.css', bbb: 'ccc'}, {href: '/ddd.css', eee: 'fff'}]);
  });

  it('an array of objects', () => {
    assertResult(css([{href: '/foo.css'}, {href: '/bar.css'}]), [{href: '/foo.css'}, {href: '/bar.css'}]);
    assertResult(css([{href: '/aaa.css', bbb: 'ccc'}, {href: '/ddd.css', eee: 'fff'}]),
      [{href: '/aaa.css', bbb: 'ccc'}, {href: '/ddd.css', eee: 'fff'}]);
  });

  it('relative link', () => {
    ctx.config.relative_link = true;
    ctx.config.root = '/';

    ctx.path = '';
    assertResult(css('style'), 'style.css');

    ctx.path = 'foo/bar/';
    assertResult(css('style'), '../../style.css');

    ctx.config.relative_link = false;
  });
});
