'use strict';

describe('link_to', () => {
  const Hexo = require('../../../dist/hexo');
  const hexo = new Hexo(__dirname);

  const ctx = {
    config: hexo.config
  };

  const linkTo = require('../../../dist/plugins/helper/link_to').bind(ctx);

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
