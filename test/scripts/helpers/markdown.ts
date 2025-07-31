import { dirname } from 'path';
import { fileURLToPath } from 'url';
import Hexo from '../../../lib/hexo';
import renderHelper from '../../../lib/plugins/helper/render';
import markdownHelper from '../../../lib/plugins/helper/markdown';
type MarkdownHelperParams = Parameters<typeof markdownHelper>;
type MarkdownHelperReturn = ReturnType<typeof markdownHelper>;

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

describe('markdown', () => {
  const hexo = new Hexo(__hexo_dirname);

  const ctx = {
    render: renderHelper(hexo)
  };

  const markdown: (...args: MarkdownHelperParams) => MarkdownHelperReturn = markdownHelper.bind(ctx);

  before(() => hexo.init().then(() => hexo.loadPlugin(require.resolve('hexo-renderer-marked'))));

  it('default', () => {
    markdown('123456 **bold** and *italic*').should.eql('<p>123456 <strong>bold</strong> and <em>italic</em></p>\n');
  });
});
