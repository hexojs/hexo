var should = require('should');

describe('Filters', function(){
  describe('auto_spacing', function(){
    var auto_spacing = require('../lib/plugins/filter/auto_spacing');

    before(function(){
      hexo.config.auto_spacing = true;
    });

    it('中文在前', function(){
      auto_spacing({
        content: '中文abc'
      }, function(err, data){
        should.not.exist(err);
        data.content.should.be.eql('中文 abc');
      });
    });

    it('中文在後', function(){
      auto_spacing({
        content: 'abc中文'
      }, function(err, data){
        should.not.exist(err);
        data.content.should.be.eql('abc 中文');
      });
    });

    it('字"字"字 >> 字 "字" 字', function(){
      auto_spacing({
        content: '中文"abc"中文'
      }, function(err, data){
        should.not.exist(err);
        data.content.should.be.eql('中文 "abc" 中文');
      });
    });

    after(function(){
      hexo.config.auto_spacing = false;
    })
  });

  describe('backtick_code_block', function(){
    // TODO
  });

  describe('excerpt', function(){
    var excerpt = require('../lib/plugins/filter/excerpt');

    it('with tag', function(){
      excerpt({
        content: '12345<!-- more -->67890'
      }, function(err, data){
        should.not.exist(err);
        data.content.should.be.eql('12345<a id="more"></a>67890');
        data.excerpt.should.be.eql('12345');
      });
    });

    it('no tags', function(){
      excerpt({
        content: '1234567890'
      }, function(err, data){
        should.not.exist(err);
        data.content.should.be.eql('1234567890');
        data.excerpt.should.be.eql('');
      });
    });
  });

  describe('external_link', function(){
    var external_link = require('../lib/plugins/filter/external_link');

    it('internal link', function(){
      external_link({
        content: '<a href="foo.html">foo</a>'
      }, function(err, data){
        should.not.exist(err);
        data.content.should.be.eql('<a href="foo.html">foo</a>');
      });
    });

    it('external link', function(){
      external_link({
        content: '<a href="http://zespia.tw">Zespia</a>'
      }, function(err, data){
        should.not.exist(err);
        data.content.should.be.eql('<a href="http://zespia.tw" target="_blank">Zespia</a>');
      });
    });

    it('external link but already has target="_blank" attribute', function(){
      external_link({
        content: '<a href="http://zespia.tw" target="_blank">Zespia</a>'
      }, function(err, data){
        should.not.exist(err);
        data.content.should.be.eql('<a href="http://zespia.tw" target="_blank">Zespia</a>');
      });
    });
  });

  describe('titlecase', function(){
    var titlecase = require('../lib/plugins/filter/titlecase');

    before(function(){
      hexo.config.titlecase = true;
    });

    it('normal', function(){
      titlecase({
        title: 'Today is a beatuiful day'
      }, function(err, data){
        should.not.exist(err);
        data.title.should.be.eql('Today Is a Beatuiful Day')
      });
    });

    it('all upper case', function(){
      titlecase({
        title: 'TODAY IS A BEATUIFUL DAY'
      }, function(err, data){
        should.not.exist(err);
        data.title.should.be.eql('Today Is a Beatuiful Day')
      });
    });

    it('all lower case', function(){
      titlecase({
        title: 'today is a beatuiful day'
      }, function(err, data){
        should.not.exist(err);
        data.title.should.be.eql('Today Is a Beatuiful Day')
      });
    });

    after(function(){
      hexo.config.titlecase = false;
    });
  });
});