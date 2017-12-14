var should = require('chai').should(); // eslint-disable-line

describe('External link', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var externalLink = require('../../../lib/plugins/filter/after_post_render/external_link').bind(hexo);

  hexo.config.external_link = true;
  hexo.config.url = 'http://maji.moe';

  it('disabled', () => {
    var content = 'foo'
      + '<a href="http://hexo.io/">Hexo</a>'
      + 'bar';

    var data = {content};
    hexo.config.external_link = false;

    externalLink(data);
    data.content.should.eql(content);
    hexo.config.external_link = true;
  });

  it('enabled', () => {
    var content = [
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

    var data = {content};

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
