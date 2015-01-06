var should = require('chai').should();

describe('Titlecase', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var titlecase = require('../../../lib/plugins/filter/before_post_render/titlecase').bind(hexo);

  it('disabled', function(){
    var title = 'toDAy IS A gOOd DaY';
    var data = {title: title};
    hexo.config.titlecase = false;

    titlecase(data);
    data.title.should.eql(title);
  });

  it('enabled', function(){
    var title = 'toDAy IS A gOOd DaY';
    var data = {title: title};
    hexo.config.titlecase = true;

    titlecase(data);
    data.title.should.eql('Today Is a Good Day');
  });
});