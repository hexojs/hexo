var should = require('chai').should();

describe('image_tag', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo(__dirname);
  var urlHelper = require('../../../lib/plugins/helper/url');

  var ctx = {
    config: hexo.config
  };

  ctx.url_for = urlHelper.url_for.bind(ctx);

  var img = require('../../../lib/plugins/helper/image_tag').bind(ctx);

  it('path', function(){
    img('http://hexo.io/image.jpg').should.eql('<img src="http://hexo.io/image.jpg">');
  });

  it('class (string)', function(){
    img('http://hexo.io/image.jpg', {class: 'foo'})
      .should.eql('<img src="http://hexo.io/image.jpg" class="foo">');
  });

  it('class (array)', function(){
    img('http://hexo.io/image.jpg', {class: ['foo', 'bar']})
      .should.eql('<img src="http://hexo.io/image.jpg" class="foo bar">');
  });

  it('alt', function(){
    img('http://hexo.io/image.jpg', {alt: 'Image caption'})
      .should.eql('<img src="http://hexo.io/image.jpg" alt="Image caption">');
  });
});