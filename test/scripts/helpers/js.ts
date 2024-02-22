import cheerio from 'cheerio';
import Hexo from '../../../lib/hexo';
import jsHelper from '../../../lib/plugins/helper/js';
type JsHelperParams = Parameters<typeof jsHelper>;
type JsHelperReturn = ReturnType<typeof jsHelper>;

describe('js', () => {
  const hexo = new Hexo(__dirname);

  const ctx: any = {
    config: hexo.config
  };

  const js: (...args: JsHelperParams) => JsHelperReturn = jsHelper.bind(ctx);

  function assertResult(result, expected) {
    const $ = cheerio.load(result);

    if (!Array.isArray(expected)) {
      expected = [expected];
    }

    expected.forEach((item, index) => {
      if (typeof item === 'string' || item instanceof String) {
        $('script').eq(index).attr('src')!.should.eql(item);
      } else {
        for (const attribute in item) {
          if (item[attribute] === true) {
            $('script').eq(index).attr(attribute)!.should.eql(attribute);
          } else {
            $('script').eq(index).attr(attribute)!.should.eql(item[attribute]);
          }
        }
      }
    });
  }

  it('a string', () => {
    assertResult(js('script'), '/script.js');
    assertResult(js('script.js'), '/script.js');
    assertResult(js('https://hexo.io/script.js'), 'https://hexo.io/script.js');
    assertResult(js('//hexo.io/script.js'), '//hexo.io/script.js');
  });

  it('an array', () => {
    assertResult(js(['//hexo.io/script.js']), '//hexo.io/script.js');

    assertResult(js(['foo', 'bar', 'baz']), ['/foo.js', '/bar.js', '/baz.js']);
  });

  it('multiple strings', () => {
    assertResult(js('foo', 'bar', 'baz'), ['/foo.js', '/bar.js', '/baz.js']);
  });

  it('multiple arrays', () => {
    assertResult(js(['foo', 'bar'], ['baz']), ['/foo.js', '/bar.js', '/baz.js']);
  });

  it('mixed', () => {
    assertResult(js(['foo', 'bar'], 'baz'), ['/foo.js', '/bar.js', '/baz.js']);
  });

  it('an object', () => {
    assertResult(js({src: 'script.js'}), {src: '/script.js'});
    assertResult(js({src: '/script.js'}), {src: '/script.js'});
    assertResult(js({src: 'script'}), {src: '/script.js'});
    assertResult(js({src: '/script.js', foo: 'bar'}), {src: '/script.js', foo: 'bar'});
  });

  it('multiple objects', () => {
    assertResult(js({src: '/foo.js'}, {src: '/bar.js'}), [{src: '/foo.js'}, {src: '/bar.js'}]);
    assertResult(js({src: '/aaa.js', bbb: 'ccc'}, {src: '/ddd.js', eee: 'fff'}),
      [{src: '/aaa.js', bbb: 'ccc'}, {src: '/ddd.js', eee: 'fff'}]);
  });

  it('an array of objects', () => {
    assertResult(js([{src: '/foo.js'}, {src: '/bar.js'}]), [{src: '/foo.js'}, {src: '/bar.js'}]);
    assertResult(js([{src: '/aaa.js', bbb: 'ccc'}, {src: '/ddd.js', eee: 'fff'}]),
      [{src: '/aaa.js', bbb: 'ccc'}, {src: '/ddd.js', eee: 'fff'}]);
  });

  it('async and defer attributes', () => {
    assertResult(js({src: '/foo.js', 'async': true}), {src: '/foo.js', 'async': true});
    assertResult(js({src: '/bar.js', 'defer': true}), {src: '/bar.js', 'defer': true});
  });

  it('relative link', () => {
    ctx.config.relative_link = true;
    ctx.config.root = '/';

    ctx.path = '';
    assertResult(js('script'), 'script.js');

    ctx.path = 'foo/bar/';
    assertResult(js('script'), '../../script.js');

    ctx.config.relative_link = false;
  });
});
