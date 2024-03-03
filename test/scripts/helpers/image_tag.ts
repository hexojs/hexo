import Hexo from '../../../lib/hexo';
import imageTag from '../../../lib/plugins/helper/image_tag';
type imageTagParams = Parameters<typeof imageTag>;
type imageTagReturn = ReturnType<typeof imageTag>;

describe('image_tag', () => {
  const hexo = new Hexo(__dirname);

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
