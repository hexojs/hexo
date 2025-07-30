import Hexo from '../../../lib/hexo';
import tagBlockquote from '../../../lib/plugins/tag/blockquote';

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
  __hexo_dirname = url ? require('path').dirname(require('url').fileURLToPath(url)) : '';
}

describe('blockquote', () => {
  const hexo = new Hexo(__hexo_dirname);
  const blockquote = tagBlockquote(hexo);

  before(() => hexo.init().then(() => hexo.loadPlugin(require.resolve('hexo-renderer-marked'))));

  const bq = (args, content?) => blockquote(args.split(' '), content || '');

  it('default', () => {
    const result = bq('', '123456 **bold** and *italic*');
    result.should.eql('<blockquote><p>123456 <strong>bold</strong> and <em>italic</em></p>\n</blockquote>');
  });

  it('author', () => {
    const result = bq('John Doe', '');
    result.should.eql('<blockquote><footer><strong>John Doe</strong></footer></blockquote>');
  });

  it('source', () => {
    const result = bq('Jane Austen, Pride and Prejudice');
    result.should.eql('<blockquote><footer><strong>Jane Austen</strong><cite>Pride and Prejudice</cite></footer></blockquote>');
  });

  it('link', () => {
    const result = bq('John Doe https://hexo.io/');
    result.should.eql('<blockquote><footer><strong>John Doe</strong><cite><a href="https://hexo.io/">hexo.io</a></cite></footer></blockquote>');
  });

  it('link title', () => {
    const result = bq('John Doe https://hexo.io/ Hexo');
    result.should.eql('<blockquote><footer><strong>John Doe</strong><cite><a href="https://hexo.io/">Hexo</a></cite></footer></blockquote>');
  });

  it('titlecase', () => {
    hexo.config.titlecase = true;

    const result = bq('Jane Austen, pride and prejudice');
    result.should.eql('<blockquote><footer><strong>Jane Austen</strong><cite>Pride and Prejudice</cite></footer></blockquote>');

    hexo.config.titlecase = false;
  });
});
