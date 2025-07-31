import { dirname } from 'path';
import { fileURLToPath } from 'url';
import Hexo from '../../../lib/hexo';
import imageTag from '../../../lib/plugins/helper/image_tag';
type imageTagParams = Parameters<typeof imageTag>;
type imageTagReturn = ReturnType<typeof imageTag>;

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

describe('image_tag', () => {
  const hexo = new Hexo(__hexo_dirname);

  const ctx: any = {
    config: hexo.config
  };

  const img: (...args: imageTagParams) => imageTagReturn = imageTag.bind(ctx);

  it('path', () => {
    img('https://hexo.io/image.jpg').should.eql('<img src="https://hexo.io/image.jpg">');
  });

  it('class (string)', () => {
    img('https://hexo.io/image.jpg', {class: 'foo'})
      .should.eql('<img src="https://hexo.io/image.jpg" class="foo">');
  });

  it('class (array)', () => {
    img('https://hexo.io/image.jpg', {class: ['foo', 'bar']})
      .should.eql('<img src="https://hexo.io/image.jpg" class="foo bar">');
  });

  it('alt', () => {
    img('https://hexo.io/image.jpg', {alt: 'Image caption'})
      .should.eql('<img src="https://hexo.io/image.jpg" alt="Image caption">');
  });
});
