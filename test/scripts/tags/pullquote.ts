import Hexo from '../../../lib/hexo';
import tagPullquote from '../../../lib/plugins/tag/pullquote';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

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

describe('pullquote', () => {
  const hexo = new Hexo(__hexo_dirname);
  const pullquote = tagPullquote(hexo);

  before(() => hexo.init().then(() => hexo.loadPlugin(require.resolve('hexo-renderer-marked'))));

  it('default', () => {
    const result = pullquote([], '123456 **bold** and *italic*');
    result.should.eql('<blockquote class="pullquote"><p>123456 <strong>bold</strong> and <em>italic</em></p>\n</blockquote>');
  });

  it('class', () => {
    const result = pullquote(['foo', 'bar'], '');
    result.should.eql('<blockquote class="pullquote foo bar"></blockquote>');
  });
});
