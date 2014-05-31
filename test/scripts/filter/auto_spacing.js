var should = require('chai').should();

describe('auto_spacing', function(){
  var auto_spacing = require('../../../lib/plugins/filter/auto_spacing');

  before(function(){
    hexo.config.auto_spacing = true;
  });

  it('中文在前', function(){
    auto_spacing({
      content: '中文abc'
    }, function(err, data){
      should.not.exist(err);
      data.content.should.eql('中文 abc');
    });
  });

  it('中文在後', function(){
    auto_spacing({
      content: 'abc中文'
    }, function(err, data){
      should.not.exist(err);
      data.content.should.eql('abc 中文');
    });
  });

  it('字"字"字 >> 字 "字" 字', function(){
    auto_spacing({
      content: '中文"abc"中文'
    }, function(err, data){
      should.not.exist(err);
      data.content.should.eql('中文 "abc" 中文');
    });
  });

  after(function(){
    hexo.config.auto_spacing = false;
  });
});