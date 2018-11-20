'use strict';

describe('image_tag', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);

  const ctx = {
    config: hexo.config
  };

  ctx.url_for = require('../../../lib/plugins/helper/url_for').bind(ctx);

  const img = require('../../../lib/plugins/helper/image_tag').bind(ctx);

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
