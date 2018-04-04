var should = require('chai').should(); // eslint-disable-line

describe('i18n locals', () => {
  var Hexo = require('../../../lib/hexo');
  var hexo = new Hexo();
  var i18nFilter = require('../../../lib/plugins/filter/template_locals/i18n').bind(hexo);
  var theme = hexo.theme;
  var i18n = theme.i18n;

  // Default language
  i18n.languages = ['en', 'default'];

  // Fixtures
  i18n.set('de', {
    Home: 'Zuhause'
  });

  i18n.set('default', {
    Home: 'Default Home'
  });

  i18n.set('en', {
    Home: 'Home'
  });

  i18n.set('zh-tw', {
    Home: '首頁'
  });

  it('page.lang set', () => {
    var locals = {
      config: hexo.config,
      page: {
        lang: 'zh-tw'
      }
    };

    i18nFilter(locals);

    locals.__('Home').should.eql('首頁');
  });

  it('page.language set', () => {
    var locals = {
      config: hexo.config,
      page: {
        language: 'zh-tw'
      }
    };

    i18nFilter(locals);

    locals.__('Home').should.eql('首頁');
  });

  it('detect by path (lang found)', () => {
    var locals = {
      config: hexo.config,
      page: {},
      path: 'zh-tw/index.html'
    };

    i18nFilter(locals);

    locals.page.lang.should.eql('zh-tw');
    locals.page.canonical_path.should.eql('index.html');
    locals.__('Home').should.eql('首頁');
  });

  it('detect by path (lang not found)', () => {
    var locals = {
      config: hexo.config,
      page: {},
      path: 'news/index.html'
    };

    i18nFilter(locals);

    locals.page.lang.should.eql('en');
    locals.page.canonical_path.should.eql('news/index.html');
    locals.__('Home').should.eql('Home');
  });

  it('use config by default', () => {
    var locals = {
      config: hexo.config,
      page: {},
      path: 'index.html'
    };

    i18nFilter(locals);

    locals.page.lang.should.eql('en');
    locals.page.canonical_path.should.eql('index.html');
    locals.__('Home').should.eql('Home');
  });

  it('use config by default - with multiple languages, first language should be used', () => {
    var oldConfig = i18n.languages;
    i18n.languages = ['zh-tw', 'en', 'default'];

    var locals = {
      config: hexo.config,
      page: {},
      path: 'index.html'
    };

    i18nFilter(locals);

    locals.page.lang.should.eql('zh-tw');
    locals.page.canonical_path.should.eql('index.html');
    locals.__('Home').should.eql('首頁');

    i18n.languages = oldConfig;
  });

  it('use config by default - with no languages, default language should be used', () => {
    var oldConfig = i18n.language;
    i18n.languages = ['default'];

    var locals = {
      config: hexo.config,
      page: {},
      path: 'index.html'
    };

    i18nFilter(locals);

    locals.page.lang.should.eql('default');
    locals.page.canonical_path.should.eql('index.html');
    locals.__('Home').should.eql('Default Home');

    i18n.languages = oldConfig;
  });

  it('use config by default - with unknown language, default language should be used', () => {
    var oldConfig = i18n.languages;
    i18n.languages = ['fr', 'default'];

    var locals = {
      config: hexo.config,
      page: {},
      path: 'index.html'
    };

    i18nFilter(locals);

    locals.page.lang.should.eql('fr');
    locals.page.canonical_path.should.eql('index.html');
    locals.__('Home').should.eql('Default Home');

    i18n.languages = oldConfig;
  });

  it('use config by default - with no set language and no default file take first available', () => {
    var oldConfig = i18n.languages;
    var oldSet = i18n.get('default');
    i18n.remove('default');
    i18n.languages = ['default'];

    var locals = {
      config: hexo.config,
      page: {},
      path: 'index.html'
    };

    i18nFilter(locals);

    locals.page.lang.should.eql('default');
    locals.page.canonical_path.should.eql('index.html');
    locals.__('Home').should.eql('Zuhause');

    i18n.set('default', oldSet);
    i18n.languages = oldConfig;
  });
});
