import Hexo from '../../../lib/hexo';
import decache from 'decache';
import externalLinkFilter from '../../../lib/plugins/filter/after_render/external_link';
import externalLinkPostFilter from '../../../lib/plugins/filter/after_post_render/external_link';
import chai from 'chai';
const should = chai.should();
type ExternalLinkParams = Parameters<typeof externalLinkFilter>;
type ExternalLinkReturn = ReturnType<typeof externalLinkFilter>;
type ExternalLinkPostParams = Parameters<typeof externalLinkPostFilter>;
type ExternalLinkPostReturn = ReturnType<typeof externalLinkPostFilter>;

describe('External link', () => {
  const hexo = new Hexo();
  let externalLink: (...args: ExternalLinkParams) => ExternalLinkReturn;

  beforeEach(() => {
    decache('../../../lib/plugins/filter/after_render/external_link');
    externalLink = require('../../../lib/plugins/filter/after_render/external_link').bind(hexo);
  });
  hexo.config = {
    url: 'https://example.com',
    external_link: {
      enable: true,
      field: 'site',
      exclude: ''
    }
  } as any;

  it('disabled', () => {
    const content = 'foo'
      + '<a href="https://hexo.io/">Hexo</a>'
      + 'bar';

    hexo.config.external_link.enable = false;

    should.not.exist(externalLink(content));
    hexo.config.external_link.enable = true;
  });

  it('field is post', () => {
    const content = 'foo'
      + '<a href="https://hexo.io/">Hexo</a>'
      + 'bar';

    hexo.config.external_link.field = 'post';

    should.not.exist(externalLink(content));
    hexo.config.external_link.field = 'site';
  });

  it('enabled', () => {
    const content = [
      '# External link test',
      '1. External link',
      '<a href="https://hexo.io/">Hexo</a>',
      '2. External link with "rel" Attribute',
      '<a rel="external" href="https://hexo.io/">Hexo</a>',
      '<a href="https://hexo.io/" rel="external">Hexo</a>',
      '<a rel="noopenner" href="https://hexo.io/">Hexo</a>',
      '<a href="https://hexo.io/" rel="noopenner">Hexo</a>',
      '<a rel="external noopenner" href="https://hexo.io/">Hexo</a>',
      '<a href="https://hexo.io/" rel="external noopenner">Hexo</a>',
      '3. External link with Other Attributes',
      '<a class="img" href="https://hexo.io/">Hexo</a>',
      '<a href="https://hexo.io/" class="img">Hexo</a>',
      '4. Internal link',
      '<a href="/archives/foo.html">Link</a>',
      '5. Ignore links have "target" attribute',
      '<a href="https://hexo.io/" target="_blank">Hexo</a>',
      '6. Ignore links don\'t have "href" attribute',
      '<a>Anchor</a>',
      '7. Ignore links whose hostname is same as config',
      '<a href="https://example.com">Example Domain</a>'
    ].join('\n');

    const result = externalLink(content);

    result.should.eql([
      '# External link test',
      '1. External link',
      '<a target="_blank" rel="noopener" href="https://hexo.io/">Hexo</a>',
      '2. External link with "rel" Attribute',
      '<a rel="external noopener" target="_blank" href="https://hexo.io/">Hexo</a>',
      '<a target="_blank" href="https://hexo.io/" rel="external noopener">Hexo</a>',
      '<a rel="noopenner" target="_blank" href="https://hexo.io/">Hexo</a>',
      '<a target="_blank" href="https://hexo.io/" rel="noopenner">Hexo</a>',
      '<a rel="external noopenner" target="_blank" href="https://hexo.io/">Hexo</a>',
      '<a target="_blank" href="https://hexo.io/" rel="external noopenner">Hexo</a>',
      '3. External link with Other Attributes',
      '<a class="img" target="_blank" rel="noopener" href="https://hexo.io/">Hexo</a>',
      '<a target="_blank" rel="noopener" href="https://hexo.io/" class="img">Hexo</a>',
      '4. Internal link',
      '<a href="/archives/foo.html">Link</a>',
      '5. Ignore links have "target" attribute',
      '<a href="https://hexo.io/" target="_blank">Hexo</a>',
      '6. Ignore links don\'t have "href" attribute',
      '<a>Anchor</a>',
      '7. Ignore links whose hostname is same as config',
      '<a href="https://example.com">Example Domain</a>'
    ].join('\n'));
  });

  it('exclude - string', () => {
    const content = [
      '<a href="https://foo.com/">Hexo</a>',
      '<a href="https://bar.com/">Hexo</a>',
      '<a href="https://baz.com/">Hexo</a>'
    ].join('\n');

    hexo.config.external_link.exclude = 'foo.com';

    const result = externalLink(content);

    result.should.eql([
      '<a href="https://foo.com/">Hexo</a>',
      '<a target="_blank" rel="noopener" href="https://bar.com/">Hexo</a>',
      '<a target="_blank" rel="noopener" href="https://baz.com/">Hexo</a>'
    ].join('\n'));

    hexo.config.external_link.exclude = '';
  });

  it('exclude - array', () => {
    const content = [
      '<a href="https://foo.com/">Hexo</a>',
      '<a href="https://bar.com/">Hexo</a>',
      '<a href="https://baz.com/">Hexo</a>'
    ].join('\n');

    // @ts-ignore
    hexo.config.external_link.exclude = ['foo.com', 'bar.com'];

    const result = externalLink(content);

    result.should.eql([
      '<a href="https://foo.com/">Hexo</a>',
      '<a href="https://bar.com/">Hexo</a>',
      '<a target="_blank" rel="noopener" href="https://baz.com/">Hexo</a>'
    ].join('\n'));

    hexo.config.external_link.exclude = '';
  });
});

describe('External link - post', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo();

  let externalLink: (...args: ExternalLinkPostParams) => ExternalLinkPostReturn;

  beforeEach(() => {
    decache('../../../lib/plugins/filter/after_post_render/external_link');
    externalLink = require('../../../lib/plugins/filter/after_post_render/external_link').bind(hexo);
  });

  hexo.config = {
    url: 'https://example.com',
    external_link: {
      enable: true,
      field: 'post',
      exclude: ''
    }
  };

  it('disabled', () => {
    const content = 'foo<a href="https://hexo.io/">Hexo</a>bar';

    const data = {content};
    hexo.config.external_link.enable = false;

    externalLink(data);
    data.content.should.eql(content);
    hexo.config.external_link.enable = true;
  });

  it('field is site', () => {
    const content = 'foo'
      + '<a href="https://hexo.io/">Hexo</a>'
      + 'bar';

    const data = {content};
    hexo.config.external_link.field = 'site';

    externalLink(data);
    data.content.should.eql(content);
    hexo.config.external_link.field = 'post';
  });

  it('enabled', () => {
    const content = [
      '# External link test',
      '1. External link',
      '<a href="https://hexo.io/">Hexo</a>',
      '2. Link with hash (#), mailto: , javascript: shouldn\'t be processed',
      '<a href="#top">Hexo</a>',
      '<a href="mailto:hi@hexo.io">Hexo</a>',
      '<a href="javascript:alert(\'Hexo is awesome!\');">Hexo</a>',
      '3. External link with "rel" Attribute',
      '<a rel="external" href="https://hexo.io/">Hexo</a>',
      '<a href="https://hexo.io/" rel="external">Hexo</a>',
      '<a rel="noopenner" href="https://hexo.io/">Hexo</a>',
      '<a href="https://hexo.io/" rel="noopenner">Hexo</a>',
      '<a rel="external noopenner" href="https://hexo.io/">Hexo</a>',
      '<a href="https://hexo.io/" rel="external noopenner">Hexo</a>',
      '4. External link with Other Attributes',
      '<a class="img" href="https://hexo.io/">Hexo</a>',
      '<a href="https://hexo.io/" class="img">Hexo</a>',
      '5. Internal link',
      '<a href="/archives/foo.html">Link</a>',
      '6. Ignore links have "target" attribute',
      '<a href="https://hexo.io/" target="_blank">Hexo</a>',
      '7. Ignore links don\'t have "href" attribute',
      '<a>Anchor</a>',
      '8. Ignore links whose hostname is same as config',
      '<a href="https://example.com">Example Domain</a>'
    ].join('\n');

    const data = {content};
    externalLink(data);

    data.content.should.eql([
      '# External link test',
      '1. External link',
      '<a target="_blank" rel="noopener" href="https://hexo.io/">Hexo</a>',
      '2. Link with hash (#), mailto: , javascript: shouldn\'t be processed',
      '<a href="#top">Hexo</a>',
      '<a href="mailto:hi@hexo.io">Hexo</a>',
      '<a href="javascript:alert(\'Hexo is awesome!\');">Hexo</a>',
      '3. External link with "rel" Attribute',
      '<a rel="external noopener" target="_blank" href="https://hexo.io/">Hexo</a>',
      '<a target="_blank" href="https://hexo.io/" rel="external noopener">Hexo</a>',
      '<a rel="noopenner" target="_blank" href="https://hexo.io/">Hexo</a>',
      '<a target="_blank" href="https://hexo.io/" rel="noopenner">Hexo</a>',
      '<a rel="external noopenner" target="_blank" href="https://hexo.io/">Hexo</a>',
      '<a target="_blank" href="https://hexo.io/" rel="external noopenner">Hexo</a>',
      '4. External link with Other Attributes',
      '<a class="img" target="_blank" rel="noopener" href="https://hexo.io/">Hexo</a>',
      '<a target="_blank" rel="noopener" href="https://hexo.io/" class="img">Hexo</a>',
      '5. Internal link',
      '<a href="/archives/foo.html">Link</a>',
      '6. Ignore links have "target" attribute',
      '<a href="https://hexo.io/" target="_blank">Hexo</a>',
      '7. Ignore links don\'t have "href" attribute',
      '<a>Anchor</a>',
      '8. Ignore links whose hostname is same as config',
      '<a href="https://example.com">Example Domain</a>'
    ].join('\n'));
  });


  it('backward compatibility', () => {
    const content = 'foo'
      + '<a href="https://hexo.io/">Hexo</a>'
      + 'bar';

    const data = {content};
    hexo.config.external_link = false;

    externalLink(data);
    data.content.should.eql(content);

    hexo.config.external_link = {
      enable: true,
      field: 'post',
      exclude: ''
    };
  });

  it('exclude - string', () => {
    const content = [
      '<a href="https://foo.com/">Hexo</a>',
      '<a href="https://bar.com/">Hexo</a>',
      '<a href="https://baz.com/">Hexo</a>'
    ].join('\n');

    hexo.config.external_link.exclude = 'foo.com';

    const data = {content};
    externalLink(data);

    data.content.should.eql([
      '<a href="https://foo.com/">Hexo</a>',
      '<a target="_blank" rel="noopener" href="https://bar.com/">Hexo</a>',
      '<a target="_blank" rel="noopener" href="https://baz.com/">Hexo</a>'
    ].join('\n'));

    hexo.config.external_link.exclude = '';
  });

  it('exclude - array', () => {
    const content = [
      '<a href="https://foo.com/">Hexo</a>',
      '<a href="https://bar.com/">Hexo</a>',
      '<a href="https://baz.com/">Hexo</a>'
    ].join('\n');

    hexo.config.external_link.exclude = ['foo.com', 'bar.com'];

    const data = {content};
    externalLink(data);

    data.content.should.eql([
      '<a href="https://foo.com/">Hexo</a>',
      '<a href="https://bar.com/">Hexo</a>',
      '<a target="_blank" rel="noopener" href="https://baz.com/">Hexo</a>'
    ].join('\n'));

    hexo.config.external_link.exclude = '';
  });
});
