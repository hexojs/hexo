import { dirname } from 'path';
import { fileURLToPath } from 'url';
import Hexo from '../../../lib/hexo';
import linkToHelper from '../../../lib/plugins/helper/link_to';
type LinkToHelperParams = Parameters<typeof linkToHelper>;
type LinkToHelperReturn = ReturnType<typeof linkToHelper>;

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

describe('link_to', () => {
  const hexo = new Hexo(__hexo_dirname);

  const ctx: any = {
    config: hexo.config
  };

  const linkTo: (...args: LinkToHelperParams) => LinkToHelperReturn = linkToHelper.bind(ctx);

  it('path', () => {
    linkTo('https://hexo.io/').should.eql('<a href="https://hexo.io/" title="hexo.io">hexo.io</a>');
  });

  it('title', () => {
    linkTo('https://hexo.io/', 'Hexo').should.eql('<a href="https://hexo.io/" title="Hexo">Hexo</a>');
  });

  it('external (boolean)', () => {
    linkTo('https://hexo.io/', 'Hexo', true)
      .should.eql('<a href="https://hexo.io/" title="Hexo" target="_blank" rel="noopener">Hexo</a>');
  });

  it('external (object)', () => {
    linkTo('https://hexo.io/', 'Hexo', {external: true})
      .should.eql('<a href="https://hexo.io/" title="Hexo" target="_blank" rel="noopener">Hexo</a>');
  });

  it('class (string)', () => {
    linkTo('https://hexo.io/', 'Hexo', {class: 'foo'})
      .should.eql('<a href="https://hexo.io/" title="Hexo" class="foo">Hexo</a>');
  });

  it('class (array)', () => {
    linkTo('https://hexo.io/', 'Hexo', {class: ['foo', 'bar']})
      .should.eql('<a href="https://hexo.io/" title="Hexo" class="foo bar">Hexo</a>');
  });

  it('id', () => {
    linkTo('https://hexo.io/', 'Hexo', {id: 'foo'})
      .should.eql('<a href="https://hexo.io/" title="Hexo" id="foo">Hexo</a>');
  });
});
