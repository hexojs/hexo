import { dirname } from 'path';
import { fileURLToPath } from 'url';
import Hexo from '../../../lib/hexo';
import renderHelper from '../../../lib/plugins/helper/render';

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

describe('render', () => {
  const hexo = new Hexo(__hexo_dirname);
  const render = renderHelper(hexo);

  before(() => hexo.init());

  it('default', () => {
    const body = [
      'foo: 1',
      'bar:',
      '\tbaz: 3'
    ].join('\n');

    const result = render(body, 'yaml');

    result.should.eql({
      foo: 1,
      bar: {
        baz: 3
      }
    });
  });
});
