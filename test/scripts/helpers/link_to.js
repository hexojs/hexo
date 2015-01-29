'use strict';

var should = require('chai').should();

describe('link_to', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);

  var ctx = {
    config: hexo.config
  };

  ctx.url_for = require('../../../lib/plugins/helper/url_for').bind(ctx);

  var linkTo = require('../../../lib/plugins/helper/link_to').bind(ctx);

  it('path', function(){
    linkTo('http://hexo.io/').should.eql('<a href="http://hexo.io/" title="hexo.io">hexo.io</a>');
  });

  it('title', function(){
    linkTo('http://hexo.io/', 'Hexo').should.eql('<a href="http://hexo.io/" title="Hexo">Hexo</a>');
  });

  it('external (boolean)', function(){
    linkTo('http://hexo.io/', 'Hexo', true)
      .should.eql('<a href="http://hexo.io/" title="Hexo" target="_blank" rel="external">Hexo</a>');
  });

  it('external (object)', function(){
    linkTo('http://hexo.io/', 'Hexo', {external: true})
      .should.eql('<a href="http://hexo.io/" title="Hexo" target="_blank" rel="external">Hexo</a>');
  });

  it('class (string)', function(){
    linkTo('http://hexo.io/', 'Hexo', {class: 'foo'})
      .should.eql('<a href="http://hexo.io/" title="Hexo" class="foo">Hexo</a>');
  });

  it('class (array)', function(){
    linkTo('http://hexo.io/', 'Hexo', {class: ['foo', 'bar']})
      .should.eql('<a href="http://hexo.io/" title="Hexo" class="foo bar">Hexo</a>');
  });

  it('id', function(){
    linkTo('http://hexo.io/', 'Hexo', {id: 'foo'})
      .should.eql('<a href="http://hexo.io/" title="Hexo" id="foo">Hexo</a>');
  });
});