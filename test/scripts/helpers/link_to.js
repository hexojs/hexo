'use strict';

require('chai').should();

describe('link_to', () => {
  const Hexo = require('../../../lib/hexo');
  const hexo = new Hexo(__dirname);

  const ctx = {
    config: hexo.config
  };

  ctx.url_for = require('../../../lib/plugins/helper/url_for').bind(ctx);

  const linkTo = require('../../../lib/plugins/helper/link_to').bind(ctx);

  it('path', () => {
    linkTo('http://hexo.io/').should.eql('<a href="http://hexo.io/" title="hexo.io">hexo.io</a>');
  });

  it('title', () => {
    linkTo('http://hexo.io/', 'Hexo').should.eql('<a href="http://hexo.io/" title="Hexo">Hexo</a>');
  });

  it('external (boolean)', () => {
    linkTo('http://hexo.io/', 'Hexo', true)
      .should.eql('<a href="http://hexo.io/" title="Hexo" target="_blank" rel="noopener">Hexo</a>');
  });

  it('external (object)', () => {
    linkTo('http://hexo.io/', 'Hexo', {external: true})
      .should.eql('<a href="http://hexo.io/" title="Hexo" target="_blank" rel="noopener">Hexo</a>');
  });

  it('class (string)', () => {
    linkTo('http://hexo.io/', 'Hexo', {class: 'foo'})
      .should.eql('<a href="http://hexo.io/" title="Hexo" class="foo">Hexo</a>');
  });

  it('class (array)', () => {
    linkTo('http://hexo.io/', 'Hexo', {class: ['foo', 'bar']})
      .should.eql('<a href="http://hexo.io/" title="Hexo" class="foo bar">Hexo</a>');
  });

  it('id', () => {
    linkTo('http://hexo.io/', 'Hexo', {id: 'foo'})
      .should.eql('<a href="http://hexo.io/" title="Hexo" id="foo">Hexo</a>');
  });
});
