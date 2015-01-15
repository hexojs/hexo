var should = require('chai').should();

describe('i18n locals', function(){
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var i18nFilter = require('../../../lib/plugins/filter/template_locals/i18n').bind(hexo);
  var theme = hexo.theme;
  var i18n = theme.i18n;

  // Default language
  hexo.config.language = 'en';

  // Fixtures
  i18n.set('en', {
    Home: 'Home'
  });

  i18n.set('zh-tw', {
    Home: '首頁'
  });

  it('page.lang', function(){
    var locals = {
      config: hexo.config,
      page: {
        lang: 'zh-tw'
      }
    };

    i18nFilter(locals);

    locals.__('Home').should.eql('首頁');
  });

  it('page.language', function(){
    var locals = {
      config: hexo.config,
      page: {
        language: 'zh-tw'
      }
    };

    i18nFilter(locals);

    locals.__('Home').should.eql('首頁');
  });

  it('path', function(){
    var locals = {
      config: hexo.config,
      page: {},
      path: 'zh-tw/index.html'
    };

    i18nFilter(locals);

    locals.page.lang = 'zh-tw';
    locals.__('Home').should.eql('首頁');
  });

  it('config', function(){
    var locals = {
      config: hexo.config,
      page: {},
      path: 'index.html'
    };

    i18nFilter(locals);

    locals.__('Home').should.eql('Home');
  });
});