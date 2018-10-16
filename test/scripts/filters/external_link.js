require('chai').should(); // eslint-disable-line strict

describe('External link', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();
  const externalLink = require('../../../lib/plugins/filter/after_post_render/external_link').bind(hexo);

  hexo.config.external_link = true;
  hexo.config.url = 'http://maji.moe';

  it('disabled', () => {
    const content = 'foo'
      + '<a href="http://hexo.io/">Hexo</a>'
      + 'bar';

    const data = {content};
    hexo.config.external_link = false;

    externalLink(data);
    data.content.should.eql(content);
    hexo.config.external_link = true;
  });

  it('enabled', () => {
    const content = [
      '# External link test',
      '1. External link',
      '<a href="http://hexo.io/">Hexo</a>',
      '2. Internal link',
      '<a href="/archives/foo.html">Link</a>',
      '3. Ignore links have "target" attribute',
      '<a href="http://hexo.io/" target="_blank">Hexo</a>',
      '4. Ignore links don\'t have "href" attribute',
      '<a>Anchor</a>',
      '5. Ignore links whose hostname is same as config',
      '<a href="http://maji.moe">moe</a>'
    ].join('\n');

    const data = {content};

    externalLink(data);

    data.content.should.eql([
      '# External link test',
      '1. External link',
      '<a href="http://hexo.io/" target="_blank" rel="noopener">Hexo</a>',
      '2. Internal link',
      '<a href="/archives/foo.html">Link</a>',
      '3. Ignore links have "target" attribute',
      '<a href="http://hexo.io/" target="_blank">Hexo</a>',
      '4. Ignore links don\'t have "href" attribute',
      '<a>Anchor</a>',
      '5. Ignore links whose hostname is same as config',
      '<a href="http://maji.moe">moe</a>'
    ].join('\n'));
  });
});
