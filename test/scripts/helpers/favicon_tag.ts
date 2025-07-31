import { dirname } from 'path';
import { fileURLToPath } from 'url';
import Hexo from '../../../lib/hexo';
import faviconTag from '../../../lib/plugins/helper/favicon_tag';
type faviconTagParams = Parameters<typeof faviconTag>;
type faviconTagReturn = ReturnType<typeof faviconTag>;

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

describe('favicon_tag', () => {
  const hexo = new Hexo(__hexo_dirname);

  const ctx = {
    config: hexo.config
  };

  const favicon: (...args: faviconTagParams) => faviconTagReturn = faviconTag.bind(ctx);

  it('path', () => {
    favicon('favicon.ico').should.eql('<link rel="shortcut icon" href="/favicon.ico">');
  });
});
